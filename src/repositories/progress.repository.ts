/**
 * Progress repository
 * ID: PROGRESS_REPO_001
 */
import { supabase } from '../lib/supabase';
import { ProgressSnapshot } from '../types/database';

export class ProgressRepository {
  /**
   * Upsert goal snapshot using RPC
   */
  async upsertGoalSnapshot(goalId: string, date: string): Promise<void> {
    const { error } = await supabase.rpc('upsert_goal_snapshot', {
      goal_id: goalId,
      date,
    });

    if (error) {
      throw error;
    }
  }

  /**
   * Get snapshot by goal ID and date
   */
  async getSnapshot(goalId: string, date: string): Promise<ProgressSnapshot | null> {
    const { data, error } = await supabase
      .from('progress_snapshots')
      .select('*')
      .eq('goal_id', goalId)
      .eq('snapshot_date', date)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    return data;
  }

  /**
   * Get latest snapshot for goal
   */
  async getLatestSnapshot(goalId: string): Promise<ProgressSnapshot | null> {
    const { data, error } = await supabase
      .from('progress_snapshots')
      .select('*')
      .eq('goal_id', goalId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    return data;
  }
}

export const progressRepository = new ProgressRepository();

