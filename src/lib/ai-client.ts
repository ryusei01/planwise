/**
 * AI Client abstraction
 * ID: AI_CLIENT_001
 * 
 * Provides mock AI functionality that can be replaced with OpenAI etc.
 */
import { supabase } from './supabase';
import { Task, AIRunType } from '../types/database';

export interface AITaskSuggestion {
  title: string;
  description?: string;
  priority: number;
  estimated_days?: number;
}

export interface AISplitResult {
  tasks: AITaskSuggestion[];
  reasoning: string;
}

export interface AIReplanResult {
  tasks: AITaskSuggestion[];
  reasoning: string;
  droppedTaskIds: string[];
}

/**
 * Mock AI Client
 * TODO(#AI_001): Replace with actual OpenAI implementation
 */
export class AIClient {
  /**
   * Split a goal into tasks using AI
   */
  async splitGoalIntoTasks(
    goalTitle: string,
    goalDescription: string | null,
    startDate: string,
    endDate: string
  ): Promise<AISplitResult> {
    // Save AI run
    const runId = await this.saveAIRun('split', {
      goalTitle,
      goalDescription,
      startDate,
      endDate,
    });

    // Mock implementation
    const daysDiff = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const numTasks = Math.min(Math.max(3, Math.floor(daysDiff / 7)), 10);

    const mockTasks: AITaskSuggestion[] = [];
    for (let i = 1; i <= numTasks; i++) {
      mockTasks.push({
        title: `${goalTitle} - ステップ ${i}`,
        description: `「${goalTitle}」を達成するためのステップ ${i}`,
        priority: i <= 2 ? 1 : 2,
        estimated_days: Math.ceil(daysDiff / numTasks),
      });
    }

    const result: AISplitResult = {
      tasks: mockTasks,
      reasoning: `目標「${goalTitle}」を${numTasks}個のタスクに分割しました。期間は${daysDiff}日間です。`,
    };

    // Update AI run with result
    await this.updateAIRun(runId, 'completed', result as unknown as Record<string, unknown>);

    return result;
  }

  /**
   * Replan tasks based on current progress
   */
  async replanTasks(
    goalTitle: string,
    currentTasks: Task[],
    daysRemaining: number
  ): Promise<AIReplanResult> {
    // Save AI run
    const runId = await this.saveAIRun('replan', {
      goalTitle,
      currentTasks: currentTasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
      daysRemaining,
    });

    // Mock implementation
    const incompleteTasks = currentTasks.filter(t => t.status !== 'done');
    const completedCount = currentTasks.filter(t => t.status === 'done').length;

    // Suggest dropping low priority tasks if behind schedule
    const tasksToKeep = incompleteTasks
      .sort((a, b) => a.priority - b.priority)
      .slice(0, Math.min(incompleteTasks.length, Math.ceil(daysRemaining / 3)));
    
    const droppedTaskIds = incompleteTasks
      .filter(t => !tasksToKeep.includes(t))
      .map(t => t.id);

    const replanedTasks: AITaskSuggestion[] = tasksToKeep.map((task, index) => ({
      title: task.title,
      description: task.description || undefined,
      priority: index + 1,
      estimated_days: Math.max(1, Math.floor(daysRemaining / tasksToKeep.length)),
    }));

    const result: AIReplanResult = {
      tasks: replanedTasks,
      reasoning: `残り${daysRemaining}日で${incompleteTasks.length}タスクを見直しました。` +
        (droppedTaskIds.length > 0 
          ? `優先度の低い${droppedTaskIds.length}タスクの中止を提案します。`
          : '全タスクを維持することを推奨します。'),
      droppedTaskIds,
    };

    // Update AI run with result
    await this.updateAIRun(runId, 'completed', result as unknown as Record<string, unknown>);

    return result;
  }

  /**
   * Save AI run to database
   */
  private async saveAIRun(
    type: AIRunType,
    input: Record<string, unknown>
  ): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('ai_runs')
      .insert({
        user_id: user.id,
        goal_id: null, // Will be updated when available
        type,
        prompt_version: 'mock-v1',
        model: 'mock',
        input,
        status: 'running',
      })
      .select()
      .single();

    if (error) {
      console.warn('Failed to save AI run:', error);
      return 'mock-run-id';
    }

    return data?.id || 'mock-run-id';
  }

  /**
   * Update AI run with result
   */
  private async updateAIRun(
    runId: string,
    status: string,
    output: Record<string, unknown>
  ): Promise<void> {
    if (runId === 'mock-run-id') return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('ai_runs')
      .update({
        status,
        output,
      })
      .eq('id', runId);
  }
}

export const aiClient = new AIClient();
