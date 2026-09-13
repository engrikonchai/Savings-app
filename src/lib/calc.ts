import type { Goal } from './types';

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
