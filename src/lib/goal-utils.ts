/**
 * Goal utility functions
 * ID: GOAL_UTILS_001
 */
import { Goal, Task } from '../types/database';

export interface GoalWithStats extends Goal {
  totalTasks: number;
  doneTasks: number;
}

/**
 * Calculate task statistics for goals
 * ID: GOAL_UTILS_002
 */
export async function getGoalStats(goal: Goal, tasks: Task[]): Promise<{ totalTasks: number; doneTasks: number }> {
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  return { totalTasks, doneTasks };
}

/**
 * Get tasks due soon (within 3 days)
 * ID: GOAL_UTILS_003
 */
export function getTasksDueSoon(tasks: Task[], days: number = 3): Task[] {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + days);

  return tasks
    .filter((task) => {
      if (!task.due_date || task.status === 'done' || task.status === 'dropped') {
        return false;
      }
      const dueDate = new Date(task.due_date);
      return dueDate >= now && dueDate <= futureDate;
    })
    .sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
}

