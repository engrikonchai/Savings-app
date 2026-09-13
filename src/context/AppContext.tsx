import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { AppState, Goal, GoalTypeId, ThemeMode, Transaction, TransactionKind } from '../lib/types';
import { DEFAULT_STATE, loadState, saveState } from '../lib/storage';
import { addDays, clampFutureDate, computePace, daysWorth, weeksBetween } from '../lib/calc';
import { goalTypeDef } from '../lib/goalTypes';

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
  createGoal: (input: NewGoalInput) => void;
  editGoal: (updates: Partial<Pick<Goal, 'name' | 'targetAmount' | 'currentSaved' | 'predictedDate'>>) => void;
  switchGoalType: (typeId: GoalTypeId) => void;
  addContribution: (amount: number, source: string) => Transaction;
  addSkip: (amount: number, itemName: string) => Transaction;
  addPurchase: (amount: number, itemName: string) => Transaction;
  setThemeMode: (mode: ThemeMode) => void;
  setCurrency: (code: string) => void;
  toggleNotif: () => void;
  setProfileName: (name: string) => void;
  markCelebrationSeen: () => void;
  resetApp: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

type Action =
  | { type: 'CREATE_GOAL'; payload: NewGoalInput }
  | { type: 'EDIT_GOAL'; payload: Partial<Pick<Goal, 'name' | 'targetAmount' | 'currentSaved' | 'predictedDate'>> }
  | { type: 'SWITCH_GOAL_TYPE'; payload: GoalTypeId }
  | { type: 'ADD_TRANSACTION'; payload: { kind: TransactionKind; amount: number; label: string; today: Date } }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'TOGGLE_NOTIF' }
  | { type: 'SET_PROFILE_NAME'; payload: string }
  | { type: 'MARK_CELEBRATION_SEEN' }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_GOAL': {
      const { typeId, name, targetAmount, currentSaved, predictedDate } = action.payload;
      const goal: Goal = {
        typeId,
        name,
        targetAmount,
        currentSaved,
        predictedDate,
        createdAt: new Date().toISOString(),
      };
      return { ...state, onboarded: true, goal, transactions: [], celebrationSeen: false };
    }
    case 'EDIT_GOAL': {
      if (!state.goal) return state;
      return { ...state, goal: { ...state.goal, ...action.payload } };
    }
    case 'SWITCH_GOAL_TYPE': {
      if (!state.goal) return state;
      const def = goalTypeDef(action.payload);
      return { ...state, goal: { ...state.goal, typeId: action.payload, name: def.defaultName } };
    }
    case 'ADD_TRANSACTION': {
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
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const lastTxRef = React.useRef<Transaction | null>(null);

  const value = useMemo<Ctx>(
    () => ({
      state,
      today,
      createGoal: (input) => dispatch({ type: 'CREATE_GOAL', payload: input }),
      editGoal: (updates) => dispatch({ type: 'EDIT_GOAL', payload: updates }),
      switchGoalType: (typeId) => dispatch({ type: 'SWITCH_GOAL_TYPE', payload: typeId }),
      addContribution: (amount, source) => {
        const tx: Transaction = buildPreviewTx(state.goal, 'contribution', amount, source, today);
        lastTxRef.current = tx;
        dispatch({ type: 'ADD_TRANSACTION', payload: { kind: 'contribution', amount, label: source, today } });
        return tx;
      },
      addSkip: (amount, itemName) => {
        const label = `Skipped: ${itemName.trim() || 'Purchase'}`;
        const tx = buildPreviewTx(state.goal, 'skip', amount, label, today);
        lastTxRef.current = tx;
        dispatch({ type: 'ADD_TRANSACTION', payload: { kind: 'skip', amount, label, today } });
        return tx;
      },
      addPurchase: (amount, itemName) => {
        const label = itemName.trim() || 'Purchase';
        const tx = buildPreviewTx(state.goal, 'purchase', amount, label, today);
        lastTxRef.current = tx;
        dispatch({ type: 'ADD_TRANSACTION', payload: { kind: 'purchase', amount, label, today } });
        return tx;
      },
      setThemeMode: (mode) => dispatch({ type: 'SET_THEME', payload: mode }),
      setCurrency: (code) => dispatch({ type: 'SET_CURRENCY', payload: code }),
      toggleNotif: () => dispatch({ type: 'TOGGLE_NOTIF' }),
      setProfileName: (name) => dispatch({ type: 'SET_PROFILE_NAME', payload: name }),
      markCelebrationSeen: () => dispatch({ type: 'MARK_CELEBRATION_SEEN' }),
      resetApp: () => dispatch({ type: 'RESET' }),
    }),
    [state, today],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

function buildPreviewTx(
  goal: Goal | null,
  kind: TransactionKind,
  amount: number,
  label: string,
  today: Date,
): Transaction {
  const pace = goal ? computePace(goal, today) : { weekly: 0 } as ReturnType<typeof computePace>;
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
