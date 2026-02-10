/**
 * Task repository
 * ID: TASK_REPO_001
 */
import { supabase } from '../lib/supabase';
import { Task, TaskStatus } from '../types/database';

export interface CreateTaskParams {
  plan_id: string;
  title: string;
  description?: string;
  priority?: number;
  due_date?: string;
  estimated_days?: number;
  order_index?: number;
}

export interface UpdateTaskParams {
  title?: string;
  description?: string;
  priority?: number;
  due_date?: string;
  estimated_days?: number;
  order_index?: number;
  status?: TaskStatus;
}

export class TaskRepository {
  /**
   * Get tasks by plan ID
   */
  async getTasksByPlanId(planId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  /**
   * Get task by ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
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
   * Create task
   */
  async createTask(params: CreateTaskParams): Promise<Task> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('tasks')
      .insert({
        plan_id: params.plan_id,
        title: params.title,
        description: params.description || null,
        priority: params.priority || 1,
        due_date: params.due_date || null,
        estimated_days: params.estimated_days || null,
        order_index: params.order_index || 0,
        status: 'todo',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Update task
   */
  async updateTask(id: string, params: UpdateTaskParams): Promise<Task> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('tasks')
      .update(params)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Task;
  }

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  }

  /**
   * Toggle task done status using RPC
   */
  async toggleTaskDone(taskId: string, done: boolean): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.rpc as any)('toggle_task_done', {
      task_id: taskId,
      done,
    });

    if (error) {
      throw error;
    }
  }
}

export const taskRepository = new TaskRepository();

