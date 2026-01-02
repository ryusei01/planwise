/**
 * Home (Dashboard) screen
 * ID: SCREEN_HOME_001
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { goalRepository, GoalWithPlan } from '../../src/repositories/goal.repository';
import { taskRepository } from '../../src/repositories/task.repository';
import { subscriptionRepository } from '../../src/repositories/subscription.repository';
import { progressRepository } from '../../src/repositories/progress.repository';
import { Goal, Task } from '../../src/types/database';
import { GoalCard } from '../../src/components/GoalCard';
import { getTasksDueSoon } from '../../src/lib/goal-utils';

interface GoalWithTasks extends Goal {
  tasks: Task[];
}

export default function HomeScreen() {
  const [goals, setGoals] = useState<GoalWithTasks[]>([]);
  const [tasksDueSoon, setTasksDueSoon] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const allGoals = await goalRepository.getGoals();
      const activeGoals = allGoals.filter((g) => g.status === 'active' || !g.status);

      // Load tasks for each goal's current plan
      const goalsWithTasks: GoalWithTasks[] = [];
      const allTasks: Task[] = [];

      for (const goal of activeGoals) {
        if (goal.current_plan_id) {
          try {
            const tasks = await taskRepository.getTasksByPlanId(goal.current_plan_id);
            goalsWithTasks.push({ ...goal, tasks });
            allTasks.push(...tasks);

            // Upsert today's snapshot if not exists
            const today = new Date().toISOString().split('T')[0];
            try {
              await progressRepository.upsertGoalSnapshot(goal.id, today);
            } catch (error) {
              // Ignore snapshot errors for now
              console.warn('Failed to upsert snapshot:', error);
            }
          } catch (error) {
            // If plan not found, add goal without tasks
            goalsWithTasks.push({ ...goal, tasks: [] });
          }
        } else {
          goalsWithTasks.push({ ...goal, tasks: [] });
        }
      }

      setGoals(goalsWithTasks);
      setTasksDueSoon(getTasksDueSoon(allTasks, 3).slice(0, 3));
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleReviewPlan = async () => {
    const hasSubscription = await subscriptionRepository.hasActiveSubscription();
    if (!hasSubscription) {
      Alert.alert(
        '有料機能',
        '計画の見直し機能は有料プランが必要です。\n\n有料プランにアップグレードしますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'アップグレード', onPress: () => {
            // TODO(#HOME_004): 課金導線を実装
            Alert.alert('情報', '課金導線は今後実装予定です');
          }},
        ]
      );
      return;
    }

    // TODO(#HOME_005): 計画見直し画面を実装
    Alert.alert('情報', '計画見直し機能は今後実装予定です');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.title}>ダッシュボード</Text>

      {/* Tasks due soon */}
      {tasksDueSoon.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今日やること</Text>
          {tasksDueSoon.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskCard}
              onPress={() => {
                // Find goal for this task
                const goal = goals.find((g) => g.tasks.some((t) => t.id === task.id));
                if (goal) {
                  router.push(`/goal/${goal.id}`);
                }
              }}
            >
              <Text style={styles.taskTitle}>{task.title}</Text>
              {task.due_date && (
                <Text style={styles.taskDueDate}>
                  {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>目標一覧</Text>
        {goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>目標がありません</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/(tabs)/goals')}
            >
              <Text style={styles.createButtonText}>目標を作成</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => {
            const totalTasks = goal.tasks.length;
            const doneTasks = goal.tasks.filter((t) => t.status === 'done').length;
            return (
              <GoalCard
                key={goal.id}
                goal={goal}
                totalTasks={totalTasks}
                doneTasks={doneTasks}
              />
            );
          })
        )}
      </View>

      {/* Review plan */}
      <TouchableOpacity style={styles.reviewButton} onPress={handleReviewPlan}>
        <Text style={styles.reviewButtonText}>計画を見直す</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  taskDueDate: {
    fontSize: 12,
    color: '#FF9500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

