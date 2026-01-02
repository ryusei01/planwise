/**
 * Goal repository
 * ID: GOAL_REPO_001
 */
import { supabase } from '../lib/supabase';
import { Goal, Plan, PeriodType } from '../types/database';

export interface CreateGoalParams {
  title: string;
  description?: string;
  category?: string;
  priority?: number;
  period_type?: PeriodType;
  start_date: string;
  end_date: string;
}

export interface GoalWithPlan extends Goal {
  plan?: Plan;
}

export class GoalRepository {
  /**
   * Get all goals for current user
   */
  async getGoals(): Promise<Goal[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get goal by ID
   */
  async getGoalById(id: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', id)
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
   * Get goal with current plan
   */
  async getGoalWithPlan(goalId: string): Promise<GoalWithPlan | null> {
    const goal = await this.getGoalById(goalId);
    if (!goal || !goal.current_plan_id) {
      return goal ? { ...goal } : null;
    }

    const { data: plan, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', goal.current_plan_id)
      .single();

    if (error) {
      // Plan not found, but goal exists
      return { ...goal };
    }

    return {
      ...goal,
      plan: plan || undefined,
    };
  }

  /**
   * Create goal with initial plan using RPC
   */
  async createGoalWithInitialPlan(params: CreateGoalParams): Promise<{ goal_id: string; plan_id: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.rpc('create_goal_with_initial_plan', {
      p_title: params.title,
      p_description: params.description || null,
      p_category: params.category || null,
      p_priority: params.priority || 1,
      p_period_type: params.period_type || 'month',
      p_start_date: params.start_date,
      p_end_date: params.end_date,
    });

    if (error) {
      throw error;
    }

    if (!data || !data.goal_id || !data.plan_id) {
      throw new Error('Failed to create goal with initial plan');
    }

    return {
      goal_id: data.goal_id,
      plan_id: data.plan_id,
    };
  }

  /**
   * Update goal
   */
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Delete goal
   */
  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }
}

export const goalRepository = new GoalRepository();

