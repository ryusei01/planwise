/**
 * Commitment repository
 * ID: COMMITMENT_REPO_001
 * 
 * Handles Mezamee-style commitment (penalty for not achieving goals)
 */
import { supabase } from '../lib/supabase';
import { GoalCommitment, PenaltyCharge, CommitmentStatus } from '../types/database';

export interface CreateCommitmentParams {
  goal_id: string;
  amount: number;
  currency?: string;
  threshold_percent?: number;
}

export class CommitmentRepository {
  /**
   * Create a commitment for a goal
   */
  async createCommitment(params: CreateCommitmentParams): Promise<GoalCommitment> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('goal_commitments')
      .insert({
        goal_id: params.goal_id,
        user_id: user.id,
        amount: params.amount,
        currency: params.currency || 'JPY',
        threshold_percent: params.threshold_percent || 100,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as GoalCommitment;
  }

  /**
   * Get commitment by goal ID
   */
  async getCommitmentByGoalId(goalId: string): Promise<GoalCommitment | null> {
    const { data, error } = await supabase
      .from('goal_commitments')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    return data as GoalCommitment;
  }

  /**
   * Get all active commitments for current user
   */
  async getActiveCommitments(): Promise<GoalCommitment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('goal_commitments')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as GoalCommitment[];
  }

  /**
   * Get all commitments for current user
   */
  async getAllCommitments(): Promise<GoalCommitment[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('goal_commitments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as GoalCommitment[];
  }

  /**
   * Update commitment status
   */
  async updateCommitmentStatus(
    commitmentId: string,
    status: CommitmentStatus
  ): Promise<GoalCommitment> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('goal_commitments')
      .update({
        status,
        evaluated_at: new Date().toISOString(),
      })
      .eq('id', commitmentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as GoalCommitment;
  }

  /**
   * Cancel a commitment (before deadline)
   */
  async cancelCommitment(commitmentId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('goal_commitments')
      .update({ status: 'cancelled' })
      .eq('id', commitmentId);

    if (error) {
      throw error;
    }
  }

  /**
   * Create a penalty charge record
   */
  async createPenaltyCharge(
    commitment: GoalCommitment,
    actualCompletionPercent: number
  ): Promise<PenaltyCharge> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('penalty_charges')
      .insert({
        commitment_id: commitment.id,
        user_id: commitment.user_id,
        amount: commitment.amount,
        currency: commitment.currency,
        status: 'pending',
        actual_completion_percent: actualCompletionPercent,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as PenaltyCharge;
  }

  /**
   * Get penalty charges for current user
   */
  async getPenaltyCharges(): Promise<PenaltyCharge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('penalty_charges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return (data || []) as PenaltyCharge[];
  }

  /**
   * Calculate total pending penalties for current user
   */
  async getTotalPendingPenalties(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return 0;
    }

    const { data, error } = await supabase
      .from('penalty_charges')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'pending');

    if (error) {
      return 0;
    }

    return (data || []).reduce((sum, charge: { amount?: number }) => sum + (charge.amount || 0), 0);
  }
}

export const commitmentRepository = new CommitmentRepository();
