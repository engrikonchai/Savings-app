import { Goal, Transaction } from '../types/models';
import { daysBetween, daysFromToday } from './date';

export interface GoalProgress {
  savedAmount: number;
  remainingAmount: number;
  progressRatio: number; // 0..1, clamped for display
  rawProgressRatio: number; // unclamped, can exceed 1
  percent: number; // 0..100+ rounded
  daysLeft: number; // days from today to target, floor 0
  isPastDue: boolean;
  dailyNeeded: number;
  weeklyNeeded: number;
  isComplete: boolean;
}

export function sumTransactions(transactions: Transaction[], goalId: string): number {
  return transactions
    .filter((t) => t.goalId === goalId)
    .reduce((total, t) => total + (t.kind === 'saved' ? t.amount : -t.amount), 0);
}

export function calculateGoalProgress(
  goal: Goal,
  transactions: Transaction[],
): GoalProgress {
  const savedAmountRaw = sumTransactions(transactions, goal.id);
  const savedAmount = Math.max(0, savedAmountRaw);
  const remainingAmount = Math.max(0, goal.targetAmount - savedAmount);
  const rawProgressRatio = goal.targetAmount > 0 ? savedAmountRaw / goal.targetAmount : 0;
  const progressRatio = Math.min(1, Math.max(0, rawProgressRatio));
  const daysLeftRaw = daysFromToday(goal.targetDate);
  const daysLeft = Math.max(0, daysLeftRaw);
  const isPastDue = daysLeftRaw < 0;
  const isComplete = savedAmount >= goal.targetAmount && goal.targetAmount > 0;

  const effectiveDays = daysLeft > 0 ? daysLeft : 1;
  const dailyNeeded = isComplete ? 0 : remainingAmount / effectiveDays;
  const weeklyNeeded = dailyNeeded * 7;

  return {
    savedAmount,
    remainingAmount,
    progressRatio,
    rawProgressRatio,
    percent: Math.round(rawProgressRatio * 100),
    daysLeft,
    isPastDue,
    dailyNeeded,
    weeklyNeeded,
    isComplete,
  };
}

/**
 * The baseline pace a goal needs to hit its target: how many days of
 * "runway" one currency unit is worth, derived from the goal's total
 * timeline. Used to translate a single transaction into a day shift.
 */
function dayValuePerUnit(goal: Goal): number {
  const totalDays = Math.max(1, daysBetween(goal.createdAt, goal.targetDate));
  if (goal.targetAmount <= 0) return 0;
  return totalDays / goal.targetAmount;
}

/**
 * How many days closer (positive) or farther (negative) a transaction of
 * `signedAmount` (positive = saved, negative = spent) moves the goal,
 * measured against the daily pace required to hit the target on time.
 */
export function calculateDayShift(goal: Goal, signedAmount: number): number {
  const perUnit = dayValuePerUnit(goal);
  return Math.round(signedAmount * perUnit);
}
