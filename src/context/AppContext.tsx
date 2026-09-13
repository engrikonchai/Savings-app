import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AppState, DbGoal, DbTransaction, Goal, GoalTypeId, ThemeMode, Transaction } from '../lib/types';
import { DEFAULT_STATE, loadState, saveState } from '../lib/storage';
import { addDays, clampFutureDate, computePace, daysWorth, replayGoal, weeksBetween } from '../lib/calc';
import { goalTypeDef } from '../lib/goalTypes';
import { useAuth } from './AuthContext';
import * as db from '../lib/db';

interface NewGoalInput {
  typeId: GoalTypeId;
  name: string;
  targetAmount: number;
  currentSaved: number;
  predictedDate: string;
}

interface Ctx {
  state: AppState;
  today: Date;
  /** True when there's no signed-in user — the app is showing local, throwaway preview
   * data ("My First Car") rather than anything backed by Supabase. */
  isDemoMode: boolean;
  /** True only during the one-time fetch of an existing signed-in user's data. */
  initialLoading: boolean;
  /** True while a write (create/edit goal, add a transaction) is in flight. */
  dataLoading: boolean;
  dataError: string | null;
  clearDataError: () => void;
  /** Resolves true on success — callers should check this rather than reading dataError
   * right after awaiting, since that state won't have re-rendered into their closure yet. */
  createGoal: (input: NewGoalInput) => Promise<boolean>;
  editGoal: (updates: Partial<Pick<Goal, 'name' | 'targetAmount' | 'predictedDate'>>) => Promise<void>;
  switchGoalType: (typeId: GoalTypeId) => Promise<void>;
  addContribution: (amount: number, source: string) => Promise<Transaction>;
  addSkip: (amount: number, itemName: string) => Promise<Transaction>;
  addPurchase: (amount: number, itemName: string) => Promise<Transaction>;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrency: (code: string) => void;
  toggleNotif: () => void;
  setProfileName: (name: string) => void;
  markCelebrationSeen: () => void;
  resetApp: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

// ---- Demo/guest mode: a local-only, throwaway preview shown before sign-in. Never touches
// ---- Supabase and is never the source of a real user's data (see DEMO_GOAL below). -------

const DEMO_GOAL: Goal = {
  typeId: 'car',
  name: 'My First Car',
  targetAmount: 3500,
  currentSaved: 1800,
  predictedDate: new Date(new Date().getFullYear() + 1, 8, 15).toISOString(),
  createdAt: new Date().toISOString(),
};

function demoTx(kind: Transaction['kind'], label: string, amount: number, daysAgo: number, daysDelta: number): Transaction {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { id: `demo-${label}-${daysAgo}`, kind, label, amount, date: d.toISOString(), daysDelta };
}

const DEMO_TRANSACTIONS: Transaction[] = [
  demoTx('contribution', 'Salary', 150, 3, 6.4),
  demoTx('skip', 'Skipped: Food delivery', 18, 8, 1.4),
  demoTx('purchase', 'New sneakers', 65, 15, -4.9),
];

function demoState(base: AppState): AppState {
  return { ...base, onboarded: true, goal: DEMO_GOAL, transactions: DEMO_TRANSACTIONS };
}

// ---- Local reducer: still used to hold device-local prefs (currency, theme, notifications,
// ---- profile name fallback) regardless of auth, and to drive demo-mode interactions. ------

type Action =
  | { type: 'DEMO_ADD_TRANSACTION'; payload: { kind: Transaction['kind']; amount: number; label: string; today: Date } }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'TOGGLE_NOTIF' }
  | { type: 'SET_PROFILE_NAME'; payload: string }
  | { type: 'MARK_CELEBRATION_SEEN' }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'DEMO_ADD_TRANSACTION': {
      if (!state.goal) return state;
      const { kind, amount, label, today } = action.payload;
      const pace = computePace(state.goal, today);
      const delta = daysWorth(amount, pace.weekly);
      const isSpend = kind === 'purchase';
      const daysDelta = isSpend ? -delta : delta;
      const nextSaved = isSpend ? state.goal.currentSaved : state.goal.currentSaved + amount;
      const shifted = addDays(state.goal.predictedDate, isSpend ? delta : -delta);
      const nextPredicted = clampFutureDate(shifted, today);
      const tx: Transaction = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        kind,
        label,
        amount,
        date: today.toISOString(),
        daysDelta,
      };
      return {
        ...state,
        goal: { ...state.goal, currentSaved: nextSaved, predictedDate: nextPredicted.toISOString() },
        transactions: [tx, ...state.transactions],
      };
    }
    case 'SET_THEME':
      return { ...state, themeMode: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'TOGGLE_NOTIF':
      return { ...state, notifEnabled: !state.notifEnabled };
    case 'SET_PROFILE_NAME':
      return { ...state, profileName: action.payload };
    case 'MARK_CELEBRATION_SEEN':
      return { ...state, celebrationSeen: true };
    case 'RESET':
      return { ...DEFAULT_STATE };
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [local, dispatch] = useState(() => loadState());
  const today = useMemo(() => new Date(), []);

  // Local prefs (currency/theme/notifications/demo interactions) always persist on-device.
  useEffect(() => {
    saveState(local);
  }, [local]);
  const setLocal = (updater: (s: AppState) => AppState) => dispatch(updater);

  // Cloud cache: the raw rows for the signed-in user's single active goal. `state.goal` /
  // `state.transactions` are derived from these via replayGoal — never stored directly.
  const [cloudGoal, setCloudGoal] = useState<DbGoal | null>(null);
  const [cloudTx, setCloudTx] = useState<DbTransaction[]>([]);
  const [profileName, setProfileNameState] = useState<string>('You');
  // Two distinct loading flags on purpose: `initialLoading` covers only the one-time fetch of
  // an existing user's goal/transactions/profile after sign-in (App.tsx uses this — and only
  // this — to decide whether to show a full-screen spinner before the onboarding-vs-dashboard
  // decision). `dataLoading` covers in-flight writes (createGoal, editGoal, transactions) and
  // is surfaced to individual screens for their own inline "Saving…" states. Conflating the
  // two would make the write-in-progress screen (e.g. onboarding's Step3) get stomped by a
  // full-screen loading screen the moment createGoal starts.
  const [initialLoading, setInitialLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCloudGoal(null);
      setCloudTx([]);
      return;
    }
    let cancelled = false;
    setInitialLoading(true);
    setDataError(null);
    (async () => {
      try {
        const [goal, profile] = await Promise.all([db.fetchActiveGoal(user.id), db.fetchProfile(user.id)]);
        if (cancelled) return;
        setCloudGoal(goal);
        setProfileNameState(profile?.display_name || user.email?.split('@')[0] || 'You');
        if (goal) {
          const tx = await db.fetchTransactions(goal.id);
          if (cancelled) return;
          setCloudTx(tx);
        } else {
          setCloudTx([]);
        }
      } catch (e) {
        if (!cancelled) setDataError(e instanceof Error ? e.message : 'Could not load your data.');
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isDemoMode = !user;

  const effectiveState: AppState = useMemo(() => {
    if (isDemoMode) return demoState(local);
    if (!cloudGoal) return { ...local, onboarded: false, goal: null, transactions: [], profileName };
    const { goal, transactions } = replayGoal(cloudGoal, cloudTx);
    return { ...local, onboarded: true, goal, transactions, profileName };
  }, [isDemoMode, local, cloudGoal, cloudTx, profileName]);

  const value = useMemo<Ctx>(
    () => ({
      state: effectiveState,
      today,
      isDemoMode,
      initialLoading,
      dataLoading,
      dataError,
      clearDataError: () => setDataError(null),

      createGoal: async (input) => {
        if (isDemoMode || !user) {
          // Guests only ever see the canned preview goal — this shouldn't be reachable, but
          // fail safe rather than silently pretending to create a real goal.
          setDataError('Sign in to create a real goal.');
          return false;
        }
        setDataLoading(true);
        setDataError(null);
        try {
          const goal = await db.createGoal({
            userId: user.id,
            name: input.name,
            goalType: input.typeId,
            targetAmount: input.targetAmount,
            targetDateISO: input.predictedDate,
          });
          // Hold off committing the goal to state until the optional starting-balance
          // transaction has *also* landed, and set both together. Committing the goal alone
          // first would make state.goal go non-null one network round-trip before this
          // function (and thus the onboarding flow awaiting it) actually resolves — a window
          // where a caller watching "does a goal exist yet" would get a premature yes.
          const tx =
            input.currentSaved > 0
              ? await db.addTransaction({
                  userId: user.id,
                  goalId: goal.id,
                  amount: input.currentSaved,
                  type: 'deposit',
                  note: 'Starting balance',
                })
              : null;
          setCloudGoal(goal);
          setCloudTx(tx ? [tx] : []);
          return true;
        } catch (e) {
          setDataError(e instanceof Error ? e.message : 'Could not create your goal.');
          return false;
        } finally {
          setDataLoading(false);
        }
      },

      editGoal: async (updates) => {
        if (isDemoMode) {
          setLocal((s) => (s.goal ? { ...s, goal: { ...s.goal, ...updates } } : s));
          return;
        }
        if (!cloudGoal) return;
        setDataError(null);
        try {
          const patch: Partial<Pick<DbGoal, 'name' | 'target_amount' | 'target_date'>> = {};
          if (updates.name !== undefined) patch.name = updates.name;
          if (updates.targetAmount !== undefined) patch.target_amount = updates.targetAmount;
          if (updates.predictedDate !== undefined) patch.target_date = updates.predictedDate.slice(0, 10);
          const goal = await db.updateGoal(cloudGoal.id, patch);
          setCloudGoal(goal);
        } catch (e) {
          setDataError(e instanceof Error ? e.message : 'Could not save your changes.');
        }
      },

      switchGoalType: async (typeId) => {
        const def = goalTypeDef(typeId);
        if (isDemoMode) {
          setLocal((s) => (s.goal ? { ...s, goal: { ...s.goal, typeId, name: def.defaultName } } : s));
          return;
        }
        if (!cloudGoal) return;
        setDataError(null);
        try {
          const goal = await db.updateGoal(cloudGoal.id, { goal_type: typeId, name: def.defaultName, icon: typeId });
          setCloudGoal(goal);
        } catch (e) {
          setDataError(e instanceof Error ? e.message : 'Could not switch goal type.');
        }
      },

      addContribution: async (amount, source) => {
        if (isDemoMode) {
          const tx = previewTx(effectiveState.goal, 'contribution', amount, source, today);
          setLocal((s) => reducer(s, { type: 'DEMO_ADD_TRANSACTION', payload: { kind: 'contribution', amount, label: source, today } }));
          return tx;
        }
        return cloudAddTransaction(user!.id, cloudGoal, setCloudGoal, cloudTx, setCloudTx, setDataError, {
          kind: 'contribution',
          amount,
          note: source,
          dbType: 'deposit',
        });
      },

      addSkip: async (amount, itemName) => {
        const label = `Skipped: ${itemName.trim() || 'Purchase'}`;
        if (isDemoMode) {
          const tx = previewTx(effectiveState.goal, 'skip', amount, label, today);
          setLocal((s) => reducer(s, { type: 'DEMO_ADD_TRANSACTION', payload: { kind: 'skip', amount, label, today } }));
          return tx;
        }
        return cloudAddTransaction(user!.id, cloudGoal, setCloudGoal, cloudTx, setCloudTx, setDataError, {
          kind: 'skip',
          amount,
          note: label,
          dbType: 'deposit',
        });
      },

      addPurchase: async (amount, itemName) => {
        const label = itemName.trim() || 'Purchase';
        if (isDemoMode) {
          const tx = previewTx(effectiveState.goal, 'purchase', amount, label, today);
          setLocal((s) => reducer(s, { type: 'DEMO_ADD_TRANSACTION', payload: { kind: 'purchase', amount, label, today } }));
          return tx;
        }
        return cloudAddTransaction(user!.id, cloudGoal, setCloudGoal, cloudTx, setCloudTx, setDataError, {
          kind: 'purchase',
          amount,
          note: label,
          dbType: 'withdrawal',
        });
      },

      setThemeMode: (mode) => setLocal((s) => reducer(s, { type: 'SET_THEME', payload: mode })),
      setCurrency: (code) => setLocal((s) => reducer(s, { type: 'SET_CURRENCY', payload: code })),
      toggleNotif: () => setLocal((s) => reducer(s, { type: 'TOGGLE_NOTIF' })),

      setProfileName: (name) => {
        const trimmed = name.trim() || 'You';
        if (isDemoMode || !user) {
          setLocal((s) => reducer(s, { type: 'SET_PROFILE_NAME', payload: trimmed }));
          return;
        }
        setProfileNameState(trimmed);
        db.upsertProfile(user.id, trimmed).catch((e) => setDataError(e instanceof Error ? e.message : 'Could not save your name.'));
      },

      markCelebrationSeen: () => setLocal((s) => reducer(s, { type: 'MARK_CELEBRATION_SEEN' })),
      resetApp: () => setLocal(() => ({ ...DEFAULT_STATE })),
    }),
    [effectiveState, today, isDemoMode, initialLoading, dataLoading, dataError, user, cloudGoal, cloudTx],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

function previewTx(goal: Goal | null, kind: Transaction['kind'], amount: number, label: string, today: Date): Transaction {
  const pace = goal ? computePace(goal, today) : ({ weekly: 0 } as ReturnType<typeof computePace>);
  const delta = daysWorth(amount, pace.weekly);
  return {
    id: 'preview',
    kind,
    label,
    amount,
    date: today.toISOString(),
    daysDelta: kind === 'purchase' ? -delta : delta,
  };
}

async function cloudAddTransaction(
  userId: string,
  cloudGoal: DbGoal | null,
  setCloudGoal: React.Dispatch<React.SetStateAction<DbGoal | null>>,
  cloudTx: DbTransaction[],
  setCloudTx: React.Dispatch<React.SetStateAction<DbTransaction[]>>,
  setDataError: (msg: string | null) => void,
  input: { kind: Transaction['kind']; amount: number; note: string; dbType: 'deposit' | 'withdrawal' },
): Promise<Transaction> {
  if (!cloudGoal) {
    setDataError('No active goal to record this against.');
    return { id: 'error', kind: input.kind, label: input.note, amount: input.amount, date: new Date().toISOString(), daysDelta: 0 };
  }
  const before = replayGoal(cloudGoal, cloudTx).goal;
  const today = new Date();
  setDataError(null);
  try {
    const row = await db.addTransaction({ userId, goalId: cloudGoal.id, amount: input.amount, type: input.dbType, note: input.note });
    setCloudTx((prev) => [row, ...prev]);
    const pace = computePace(before, today);
    const delta = daysWorth(input.amount, pace.weekly);
    return {
      id: row.id,
      kind: input.kind,
      label: input.note,
      amount: input.amount,
      date: row.created_at,
      daysDelta: input.dbType === 'withdrawal' ? -delta : delta,
    };
  } catch (e) {
    setDataError(e instanceof Error ? e.message : 'Could not save that.');
    throw e;
  }
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useIsDark(): boolean {
  const { state } = useApp();
  const [systemDark, setSystemDark] = React.useState(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return state.themeMode === 'system' ? systemDark : state.themeMode === 'dark';
}

export { weeksBetween };
