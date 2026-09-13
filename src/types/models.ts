export type GoalType = 'car' | 'travel' | 'phone' | 'custom';

export interface Goal {
  id: string;
  type: GoalType;
  name: string;
  targetAmount: number;
  /** ISO date string (yyyy-mm-dd) */
  targetDate: string;
  /** ISO date string of when the goal was created; used as the pace baseline. */
  createdAt: string;
  imageUri?: string;
}

export type TransactionKind = 'saved' | 'spent';

export interface Transaction {
  id: string;
  goalId: string;
  kind: TransactionKind;
  /** Always a positive value; sign is derived from `kind`. */
  amount: number;
  note?: string;
  createdAt: string;
}

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';

export interface Settings {
  currency: CurrencyCode;
  notificationsEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
  notificationsEnabled: false,
};
