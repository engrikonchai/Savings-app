import { supabase } from './supabaseClient';
import type { DbGoal, DbProfile, DbTransaction, DbTransactionType, GoalTypeId } from './types';

/** A signed-in user has (for now) a single active goal — the most recently created one.
 * "Manage goals" already surfaces multi-goal as "coming soon", so this matches the app's
 * current scope; the schema itself has no such limit if that changes later. */
export async function fetchActiveGoal(userId: string): Promise<DbGoal | null> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as DbGoal | null;
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

export interface CreateGoalInput {
  userId: string;
  name: string;
  goalType: GoalTypeId;
  targetAmount: number;
  targetDateISO: string;
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
      color: '#0A84FF',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as DbGoal;
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Pick<DbGoal, 'name' | 'goal_type' | 'target_amount' | 'target_date' | 'icon'>>,
): Promise<DbGoal> {
  const { data, error } = await supabase.from('goals').update(updates).eq('id', goalId).select('*').single();
  if (error) throw error;
  return data as DbGoal;
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
