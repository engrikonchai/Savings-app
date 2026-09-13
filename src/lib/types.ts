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

// ---- Supabase-backed shapes (signed-in mode) -------------------------------------------

export type DbTransactionType = 'deposit' | 'withdrawal';

/** Row shape of the `goals` table. `target_date` is the immutable date chosen at creation —
 * the live "predicted date" shown in the UI is derived from it plus every transaction since,
 * never stored directly (see replayGoal in calc.ts). */
export interface DbGoal {
  id: string;
  user_id: string;
  name: string;
  goal_type: GoalTypeId;
  target_amount: number;
  target_date: string;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

/** Row shape of the `transactions` table. A 'deposit' is a contribution or a Dream Days
 * "skip it" (money that would've been spent, saved instead); a 'withdrawal' is a Dream Days
 * "buy anyway" (money taken out of savings for the impulse purchase). */
export interface DbTransaction {
  id: string;
  user_id: string;
  goal_id: string;
  amount: number;
  type: DbTransactionType;
  note: string | null;
  created_at: string;
}

export interface DbProfile {
  id: string;
  display_name: string | null;
  created_at: string;
}
