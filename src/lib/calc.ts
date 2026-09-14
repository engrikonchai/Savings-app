import type { DbGoal, DbTransaction, Goal, Transaction } from './types';
import { DEFAULT_GOAL_COLOR } from './goalColors';

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_NAMES_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date | string, n: number): Date {
  const base = typeof d === 'string' ? new Date(d) : d;
  const r = new Date(base);
  r.setDate(r.getDate() + Math.round(n));
  return r;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / DAY_MS);
}

export function weeksBetween(a: Date, b: Date): number {
  return Math.max(1, Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / WEEK_MS));
}

export function formatDayMonth(d: Date): string {
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

export function formatMonthYear(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

export interface Pace {
  remaining: number;
  weeksLeft: number;
  weekly: number;
  pct: number;
  dailyRate: number;
}

/** Real, derived-from-state pace math: how much is left, how many weeks until the
 * (possibly already-shifted) predicted date, and what weekly contribution keeps pace. */
export function computePace(goal: Goal, today: Date): Pace {
  const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);
  const predicted = new Date(goal.predictedDate);
  const weeksLeft = weeksBetween(today, predicted);
  const weekly = remaining <= 0 ? 0 : Math.max(1, Math.ceil(remaining / weeksLeft));
  const dailyRate = weekly / 7;
  const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100)) : 0;
  return { remaining, weeksLeft, weekly, pct, dailyRate };
}

/** How many days a euro amount is "worth" at the current weekly pace, rounded to 1 decimal
 * the same way the design's Dream Days math does. */
export function daysWorth(amount: number, weekly: number): number {
  if (weekly <= 0) return 0;
  return Math.round(((amount * 7) / weekly) * 10) / 10;
}

export function clampFutureDate(d: Date, today: Date): Date {
  const tomorrow = addDays(today, 1);
  return d.getTime() < tomorrow.getTime() ? tomorrow : d;
}

export interface Totals {
  saved: number;
  target: number;
  pct: number;
}

/** Dashboard/Goals-list totals across every one of a user's goals — always summed fresh from
 * each goal's own (transaction-derived) currentSaved, never a separately stored figure. */
export function aggregateTotals(goals: Goal[]): Totals {
  const saved = goals.reduce((sum, g) => sum + g.currentSaved, 0);
  const target = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const pct = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
  return { saved, target, pct };
}

export function formatMoney(amount: number, symbol: string): string {
  const sign = amount < 0 ? '-' : '';
  const rounded = Math.round(Math.abs(amount));
  return `${sign}${symbol}${rounded.toLocaleString('en-US')}`;
}

export function formatDaysLabel(days: number): string {
  const abs = Math.abs(days);
  const sign = days >= 0 ? '+' : '-';
  return `${sign}${abs.toFixed(1)} day${abs === 1 ? '' : 's'}`;
}

// ---- Cloud replay: the saved amount and predicted date are never stored directly for a --
// ---- signed-in goal — they're rebuilt from the transaction log every time it's loaded. --

export interface ReplayedGoal {
  goal: Goal;
  transactions: Transaction[];
}

function noteToKindAndLabel(type: DbTransaction['type'], note: string | null): { kind: Transaction['kind']; label: string } {
  if (type === 'withdrawal') return { kind: 'purchase', label: note?.trim() || 'Purchase' };
  if (note?.startsWith('Skipped:')) return { kind: 'skip', label: note };
  return { kind: 'contribution', label: note?.trim() || 'Contribution' };
}

/** Replays a goal's full transaction history in chronological order, applying the same
 * pace/Dream-Days math the UI uses live, so the saved amount and predicted date are always
 * exactly what the ledger implies — never a separately-stored value that could drift. */
export function replayGoal(dbGoal: DbGoal, dbTransactions: DbTransaction[]): ReplayedGoal {
  const sorted = [...dbTransactions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  let saved = 0;
  let predicted = new Date(dbGoal.target_date);
  const transactions: Transaction[] = [];

  for (const tx of sorted) {
    const txDate = new Date(tx.created_at);
    const remaining = Math.max(0, dbGoal.target_amount - saved);
    const weeksLeft = weeksBetween(txDate, predicted);
    const weekly = remaining <= 0 ? 0 : Math.max(1, Math.ceil(remaining / weeksLeft));
    const delta = daysWorth(tx.amount, weekly);
    const isSpend = tx.type === 'withdrawal';

    saved = isSpend ? Math.max(0, saved - tx.amount) : saved + tx.amount;
    predicted = clampFutureDate(addDays(predicted, isSpend ? delta : -delta), txDate);

    const { kind, label } = noteToKindAndLabel(tx.type, tx.note);
    transactions.push({
      id: tx.id,
      kind,
      label,
      amount: tx.amount,
      date: tx.created_at,
      daysDelta: isSpend ? -delta : delta,
    });
  }

  const goal: Goal = {
    id: dbGoal.id,
    typeId: dbGoal.goal_type,
    name: dbGoal.name,
    targetAmount: dbGoal.target_amount,
    currentSaved: saved,
    predictedDate: predicted.toISOString(),
    createdAt: dbGoal.created_at,
    color: dbGoal.color || DEFAULT_GOAL_COLOR,
  };

  // Most-recent-first for display (History, Recent Activity).
  transactions.reverse();

  return { goal, transactions };
}
