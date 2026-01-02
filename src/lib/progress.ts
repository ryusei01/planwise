/**
 * Progress calculation utilities
 * ID: PROGRESS_001
 */
import { ProgressSnapshot } from '../types/database';

export interface ProgressStatus {
  idealRate: number; // 理想進捗率
  actualRate: number; // 実進捗率
  gapRate: number; // 乖離率
  status: 'ok' | 'warning' | 'danger'; // ステータス
}

/**
 * Calculate progress status from snapshot
 * ID: PROGRESS_002
 */
export function calculateProgressStatus(snapshot: ProgressSnapshot): ProgressStatus {
  const gapRate = snapshot.gap_rate;
  let status: 'ok' | 'warning' | 'danger';

  if (gapRate >= -0.10) {
    status = 'ok';
  } else if (gapRate > -0.25) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  return {
    idealRate: snapshot.ideal_rate,
    actualRate: snapshot.actual_rate,
    gapRate: snapshot.gap_rate,
    status,
  };
}

/**
 * Calculate progress status from task counts
 * ID: PROGRESS_003
 */
export function calculateProgressFromTasks(
  totalTasks: number,
  doneTasks: number,
  startDate: string,
  endDate: string,
  currentDate: Date = new Date()
): ProgressStatus {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = currentDate;

  // 期間日数
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  // 経過日数
  const elapsedDays = Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  // 理想進捗率 = 経過日数 / 期間日数
  const idealRate = Math.min(1, Math.max(0, elapsedDays / totalDays));

  // 実進捗率 = done_tasks / total_tasks
  const actualRate = totalTasks > 0 ? doneTasks / totalTasks : 0;

  // 乖離率 = 実 - 理想
  const gapRate = actualRate - idealRate;

  // ステータス判定
  let status: 'ok' | 'warning' | 'danger';
  if (gapRate >= -0.10) {
    status = 'ok';
  } else if (gapRate > -0.25) {
    status = 'warning';
  } else {
    status = 'danger';
  }

  return {
    idealRate,
    actualRate,
    gapRate,
    status,
  };
}

