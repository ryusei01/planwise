/**
 * Goal detail screen
 * ID: SCREEN_GOAL_DETAIL_001
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { goalRepository, GoalWithPlan } from '../../src/repositories/goal.repository';
import { taskRepository } from '../../src/repositories/task.repository';
import { subscriptionRepository } from '../../src/repositories/subscription.repository';
import { Task } from '../../src/types/database';
import { TaskItem } from '../../src/components/TaskItem';
import { ProgressBar } from '../../src/components/ProgressBar';
import { calculateProgressFromTasks } from '../../src/lib/progress';

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [goal, setGoal] = useState<GoalWithPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const loadData = async () => {
    if (!id) return;

    try {
      const [goalData, subscription] = await Promise.all([
        goalRepository.getGoalWithPlan(id),
        subscriptionRepository.hasActiveSubscription(),
      ]);

      setGoal(goalData);
      setHasActiveSubscription(subscription);

      if (goalData?.plan) {
        const taskData = await taskRepository.getTasksByPlanId(goalData.plan.id);
        setTasks(taskData);
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleToggleTask = async (taskId: string, done: boolean) => {
    try {
      await taskRepository.toggleTaskDone(taskId, done);
      // Reload tasks
      if (goal?.plan) {
        const taskData = await taskRepository.getTasksByPlanId(goal.plan.id);
        setTasks(taskData);
      }
    } catch (error: any) {
      Alert.alert('エラー', error.message || 'タスクの更新に失敗しました');
    }
  };

  const handleAIFeature = (type: 'split' | 'replan') => {
    if (!hasActiveSubscription) {
      Alert.alert(
        '有料機能',
        'この機能は有料プランが必要です。\n\n有料プランにアップグレードしますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'アップグレード', onPress: () => {
            // TODO(#GOAL_DETAIL_005): 課金導線を実装
            Alert.alert('情報', '課金導線は今後実装予定です');
          }},
        ]
      );
      return;
    }

    // TODO(#GOAL_DETAIL_006): AI 機能を実装（モック）
    Alert.alert('情報', `${type === 'split' ? 'AI で分割' : 'AI で立て直し'}機能は今後実装予定です`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!goal) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>目標が見つかりません</Text>
      </View>
    );
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = calculateProgressFromTasks(
    totalTasks,
    doneTasks,
    goal.start_date,
    goal.end_date
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{goal.title}</Text>
          {goal.description && (
            <Text style={styles.description}>{goal.description}</Text>
          )}
        </View>

        <ProgressBar progress={progress} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>タスク ({doneTasks}/{totalTasks})</Text>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>タスクがありません</Text>
          ) : (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={handleToggleTask}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI 機能</Text>
          <TouchableOpacity
            style={[styles.aiButton, !hasActiveSubscription && styles.aiButtonLocked]}
            onPress={() => handleAIFeature('split')}
          >
            <Text style={styles.aiButtonText}>
              {!hasActiveSubscription && '🔒 '}
              AI で分割
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.aiButton, !hasActiveSubscription && styles.aiButtonLocked]}
            onPress={() => handleAIFeature('replan')}
          >
            <Text style={styles.aiButtonText}>
              {!hasActiveSubscription && '🔒 '}
              AI で立て直し
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  aiButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  aiButtonLocked: {
    backgroundColor: '#8E8E93',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

