import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clearAllData,
  loadGoal,
  loadSettings,
  loadTransactions,
  saveGoal,
  saveSettings,
  saveTransactions,
} from './storage';
import {
  DEFAULT_SETTINGS,
  Goal,
  GoalType,
  Settings,
  Transaction,
  TransactionKind,
} from '../types/models';
import { generateId } from '../utils/id';

export interface NewGoalInput {
  type: GoalType;
  name: string;
  targetAmount: number;
  targetDate: string;
  imageUri?: string;
  /** Optional amount already saved before tracking started; defaults to 0. */
  startingAmount?: number;
}

export interface NewTransactionInput {
  kind: TransactionKind;
  amount: number;
  note?: string;
}

interface GoalContextValue {
  isReady: boolean;
  goal: Goal | null;
  transactions: Transaction[];
  settings: Settings;
  createGoal: (input: NewGoalInput) => Promise<Goal>;
  addTransaction: (input: NewTransactionInput) => Promise<Transaction>;
  updateSettings: (partial: Partial<Settings>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const GoalContext = createContext<GoalContextValue | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    (async () => {
      const [loadedGoal, loadedTransactions, loadedSettings] = await Promise.all([
        loadGoal(),
        loadTransactions(),
        loadSettings(),
      ]);
      setGoal(loadedGoal);
      setTransactions(loadedTransactions);
      setSettings(loadedSettings);
      setIsReady(true);
    })();
  }, []);

  const createGoal = useCallback(async (input: NewGoalInput) => {
    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: generateId(),
      type: input.type,
      name: input.name.trim(),
      targetAmount: input.targetAmount,
      targetDate: input.targetDate,
      createdAt: now,
      imageUri: input.imageUri,
    };
    const initialTransactions: Transaction[] = [];
    if (input.startingAmount && input.startingAmount > 0) {
      initialTransactions.push({
        id: generateId(),
        goalId: newGoal.id,
        kind: 'saved',
        amount: Math.round(input.startingAmount),
        note: 'Starting balance',
        createdAt: now,
      });
    }
    setGoal(newGoal);
    setTransactions(initialTransactions);
    await Promise.all([saveGoal(newGoal), saveTransactions(initialTransactions)]);
    return newGoal;
  }, []);

  const addTransaction = useCallback(
    async (input: NewTransactionInput) => {
      if (!goal) {
        throw new Error('Cannot add a transaction without an active goal.');
      }
      const transaction: Transaction = {
        id: generateId(),
        goalId: goal.id,
        kind: input.kind,
        amount: Math.abs(input.amount),
        note: input.note?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      const next = [transaction, ...transactions];
      setTransactions(next);
      await saveTransactions(next);
      return transaction;
    },
    [goal, transactions],
  );

  const updateSettings = useCallback(
    async (partial: Partial<Settings>) => {
      const next = { ...settings, ...partial };
      setSettings(next);
      await saveSettings(next);
    },
    [settings],
  );

  const resetAllData = useCallback(async () => {
    setGoal(null);
    setTransactions([]);
    setSettings(DEFAULT_SETTINGS);
    await clearAllData();
  }, []);

  const value = useMemo<GoalContextValue>(
    () => ({
      isReady,
      goal,
      transactions,
      settings,
      createGoal,
      addTransaction,
      updateSettings,
      resetAllData,
    }),
    [isReady, goal, transactions, settings, createGoal, addTransaction, updateSettings, resetAllData],
  );

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
}

export function useGoalContext(): GoalContextValue {
  const ctx = useContext(GoalContext);
  if (!ctx) {
    throw new Error('useGoalContext must be used within a GoalProvider');
  }
  return ctx;
}
