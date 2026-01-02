/**
 * Review screen
 * ID: SCREEN_REVIEW_001
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { goalRepository } from '../../src/repositories/goal.repository';
import { taskRepository } from '../../src/repositories/task.repository';
import { Task } from '../../src/types/database';

const BLOCKER_REASONS_KEY = '@planwise:blocker_reasons';

const BLOCKER_REASONS = [
  '時間が足りなかった',
  '優先順位が変わった',
  '予想以上に時間がかかった',
  'モチベーションが下がった',
  '他のタスクに割り込まれた',
  'その他',
];

export default function ReviewScreen() {
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get completed tasks this week
      const allGoals = await goalRepository.getGoals();
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      let count = 0;

      for (const goal of allGoals) {
        if (goal.current_plan_id) {
          try {
            const tasks = await taskRepository.getTasksByPlanId(goal.current_plan_id);
            const completedThisWeek = tasks.filter((task) => {
              if (task.status !== 'done' || !task.done_at) return false;
              const doneDate = new Date(task.done_at);
              return doneDate >= thisWeek;
            });
            count += completedThisWeek.length;
          } catch (error) {
            // Ignore errors
          }
        }
      }

      setCompletedCount(count);

      // Load saved blocker reasons
      const savedReasons = await AsyncStorage.getItem(BLOCKER_REASONS_KEY);
      if (savedReasons) {
        setSelectedReasons(JSON.parse(savedReasons));
      }
    } catch (error: any) {
      console.error('Failed to load review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReasonToggle = async (reason: string) => {
    const newReasons = selectedReasons.includes(reason)
      ? selectedReasons.filter((r) => r !== reason)
      : [...selectedReasons, reason];
    
    setSelectedReasons(newReasons);
    await AsyncStorage.setItem(BLOCKER_REASONS_KEY, JSON.stringify(newReasons));
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>レビュー</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>今週の完了数</Text>
          <Text style={styles.completedCount}>{completedCount} タスク</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>詰まり理由</Text>
          <Text style={styles.sectionSubtitle}>該当する理由を選択してください</Text>
          {BLOCKER_REASONS.map((reason) => (
            <View key={reason} style={styles.reasonItem}>
              <Text
                style={[
                  styles.reasonText,
                  selectedReasons.includes(reason) && styles.reasonTextSelected,
                ]}
                onPress={() => handleReasonToggle(reason)}
              >
                {selectedReasons.includes(reason) ? '✓ ' : '  '}
                {reason}
              </Text>
            </View>
          ))}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  completedCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#34C759',
  },
  reasonItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  reasonTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
});

