/**
 * Database type definitions
 * ID: DB_TYPES_001
 */

export type PeriodType = 'month' | 'year' | 'custom';
export type TaskStatus = 'todo' | 'doing' | 'done' | 'dropped';
export type PlanSource = 'manual' | 'ai_split' | 'ai_replan';
export type CreatedBy = 'user' | 'system';
export type TaskEventType = 'created' | 'updated' | 'completed' | 'reopened' | 'dropped';
export type AIRunType = 'split' | 'replan' | 'year_report';
export type SubscriptionProvider = 'appstore' | 'play' | 'stripe';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'expired';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: number;
  period_type: PeriodType;
  start_date: string;
  end_date: string;
  status: string;
  current_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  goal_id: string;
  version: number;
  source: PlanSource;
  created_by: CreatedBy;
  reason: string | null;
  ai_run_id: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  priority: number;
  due_date: string | null;
  estimated_days: number | null;
  order_index: number;
  status: TaskStatus;
  done_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskEvent {
  id: string;
  task_id: string;
  type: TaskEventType;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface ProgressSnapshot {
  id: string;
  goal_id: string;
  snapshot_date: string;
  total_tasks: number;
  done_tasks: number;
  actual_rate: number;
  ideal_rate: number;
  gap_rate: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  goal_id: string | null;
  type: string;
  title: string;
  body: string;
  delivered_at: string;
  opened_at: string | null;
  action: string | null;
}

export interface AIRun {
  id: string;
  user_id: string;
  goal_id: string;
  type: AIRunType;
  prompt_version: string;
  model: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  provider: SubscriptionProvider;
  status: SubscriptionStatus;
  current_period_end: string | null;
  updated_at: string;
}

