import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Settings, Transaction, DEFAULT_SETTINGS } from '../types/models';

const KEYS = {
  goal: '@cargoal/goal',
  transactions: '@cargoal/transactions',
  settings: '@cargoal/settings',
} as const;

export async function loadGoal(): Promise<Goal | null> {
  const raw = await AsyncStorage.getItem(KEYS.goal);
  return raw ? (JSON.parse(raw) as Goal) : null;
}

export async function saveGoal(goal: Goal | null): Promise<void> {
  if (goal === null) {
    await AsyncStorage.removeItem(KEYS.goal);
    return;
  }
  await AsyncStorage.setItem(KEYS.goal, JSON.stringify(goal));
}

export async function loadTransactions(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(KEYS.transactions);
  return raw ? (JSON.parse(raw) as Transaction[]) : [];
}

export async function saveTransactions(transactions: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.transactions, JSON.stringify(transactions));
}

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Settings) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.goal, KEYS.transactions, KEYS.settings]);
}
