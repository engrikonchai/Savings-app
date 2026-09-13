export type GoalTypeId = 'car' | 'travel' | 'phone' | 'gaming' | 'education' | 'custom';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Goal {
  typeId: GoalTypeId;
  name: string;
  targetAmount: number;
  currentSaved: number;
  /** ISO date string. The date the goal is currently predicted to be reached — shifts
   * earlier or later as money is added or Dream Days purchases are logged. */
  predictedDate: string;
  createdAt: string;
}

export type TransactionKind = 'contribution' | 'skip' | 'purchase';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  /** Human label — source for contributions/skips, item name for purchases. */
  label: string;
  amount: number;
  /** ISO date string. */
  date: string;
  /** Days the predicted date moved because of this transaction. Positive = closer, negative = further. */
  daysDelta: number;
}

export interface AppState {
  onboarded: boolean;
  goal: Goal | null;
  transactions: Transaction[];
  currency: string;
  themeMode: ThemeMode;
  notifEnabled: boolean;
  celebrationSeen: boolean;
  profileName: string;
}

export const STORAGE_KEY = 'savings-app-state-v1';
