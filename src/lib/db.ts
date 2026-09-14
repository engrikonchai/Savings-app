import { supabase } from './supabaseClient';
import type { DbGoal, DbProfile, DbTransaction, DbTransactionType, GoalTypeId } from './types';

/** Every goal belonging to a user, most recently created first. */
export async function fetchGoals(userId: string): Promise<DbGoal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbGoal[]) ?? [];
}

export async function fetchTransactions(goalId: string): Promise<DbTransaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('goal_id', goalId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbTransaction[]) ?? [];
}

/** Every transaction across every one of a user's goals, in one round trip — used to derive
 * each goal's saved amount (and the cross-goal dashboard totals) without an N+1 query per
 * goal. RLS already scopes this to the caller's own rows. */
export async function fetchAllTransactions(userId: string): Promise<DbTransaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as DbTransaction[]) ?? [];
}

export interface CreateGoalInput {
  userId: string;
  name: string;
  goalType: GoalTypeId;
  targetAmount: number;
  targetDateISO: string;
  color: string;
}

export async function createGoal(input: CreateGoalInput): Promise<DbGoal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: input.userId,
      name: input.name,
      goal_type: input.goalType,
      target_amount: input.targetAmount,
      target_date: input.targetDateISO.slice(0, 10),
      icon: input.goalType,
      color: input.color,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as DbGoal;
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Pick<DbGoal, 'name' | 'goal_type' | 'target_amount' | 'target_date' | 'icon' | 'color'>>,
): Promise<DbGoal> {
  const { data, error } = await supabase.from('goals').update(updates).eq('id', goalId).select('*').single();
  if (error) throw error;
  return data as DbGoal;
}

/** Deletes a goal and (via the schema's `on delete cascade`) every transaction logged
 * against it. RLS's `goals_delete_own` policy guarantees this can only ever target a goal
 * the caller owns. */
export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;
}

export interface AddTransactionInput {
  userId: string;
  goalId: string;
  amount: number;
  type: DbTransactionType;
  note: string | null;
}

export async function addTransaction(input: AddTransactionInput): Promise<DbTransaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: input.userId,
      goal_id: input.goalId,
      amount: input.amount,
      type: input.type,
      note: input.note,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as DbTransaction;
}

/** Deletes a single transaction. RLS's `transactions_delete_own` policy scopes this to rows
 * the caller owns; the goal's saved amount then simply re-derives lower on the next replay —
 * there is no separately stored balance to reconcile. */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
  if (error) throw error;
}

export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as DbProfile | null;
}

export async function upsertProfile(userId: string, displayName: string): Promise<DbProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: displayName })
    .select('*')
    .single();
  if (error) throw error;
  return data as DbProfile;
}
