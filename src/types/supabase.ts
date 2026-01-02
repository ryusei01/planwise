/**
 * Supabase generated types placeholder
 * ID: SUPABASE_TYPES_001
 * 
 * TODO(#SUPABASE_TYPES_001): Supabase CLI で型を生成した場合は、このファイルを置き換えてください
 * コマンド: npx supabase gen types typescript --project-id <project-id> > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          priority: number;
          period_type: 'month' | 'year' | 'custom';
          start_date: string;
          end_date: string;
          status: string;
          current_plan_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
      };
      plans: {
        Row: {
          id: string;
          goal_id: string;
          version: number;
          source: 'manual' | 'ai_split' | 'ai_replan';
          created_by: 'user' | 'system';
          reason: string | null;
          ai_run_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['plans']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['plans']['Insert']>;
      };
      tasks: {
        Row: {
          id: string;
          plan_id: string;
          title: string;
          description: string | null;
          priority: number;
          due_date: string | null;
          estimated_days: number | null;
          order_index: number;
          status: 'todo' | 'doing' | 'done' | 'dropped';
          done_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      task_events: {
        Row: {
          id: string;
          task_id: string;
          type: 'created' | 'updated' | 'completed' | 'reopened' | 'dropped';
          meta: Json | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['task_events']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['task_events']['Insert']>;
      };
      progress_snapshots: {
        Row: {
          id: string;
          goal_id: string;
          snapshot_date: string;
          total_tasks: number;
          done_tasks: number;
          actual_rate: number;
          ideal_rate: number;
          gap_rate: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['progress_snapshots']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['progress_snapshots']['Insert']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string | null;
          type: string;
          title: string;
          body: string;
          delivered_at: string;
          opened_at: string | null;
          action: string | null;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>;
      };
      ai_runs: {
        Row: {
          id: string;
          user_id: string;
          goal_id: string;
          type: 'split' | 'replan' | 'year_report';
          prompt_version: string;
          model: string;
          input: Json | null;
          output: Json | null;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ai_runs']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ai_runs']['Insert']>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          provider: 'appstore' | 'play' | 'stripe';
          status: 'active' | 'trialing' | 'canceled' | 'expired';
          current_period_end: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'updated_at'> & {
          id?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>;
      };
    };
    Functions: {
      create_goal_with_initial_plan: {
        Args: {
          p_title: string;
          p_description?: string;
          p_category?: string;
          p_priority?: number;
          p_period_type?: 'month' | 'year' | 'custom';
          p_start_date: string;
          p_end_date: string;
        };
        Returns: {
          goal_id: string;
          plan_id: string;
        };
      };
      toggle_task_done: {
        Args: {
          task_id: string;
          done: boolean;
        };
        Returns: void;
      };
      upsert_goal_snapshot: {
        Args: {
          goal_id: string;
          date: string;
        };
        Returns: void;
      };
    };
  };
}

