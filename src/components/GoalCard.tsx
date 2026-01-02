/**
 * Goal card component
 * ID: COMP_GOAL_CARD_001
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Goal } from '../types/database';
import { calculateProgressFromTasks } from '../lib/progress';

interface GoalCardProps {
  goal: Goal;
  totalTasks?: number;
  doneTasks?: number;
}

export function GoalCard({ goal, totalTasks = 0, doneTasks = 0 }: GoalCardProps) {
  const progress = calculateProgressFromTasks(
    totalTasks,
    doneTasks,
    goal.start_date,
    goal.end_date
  );

  const getStatusColor = (status: 'ok' | 'warning' | 'danger') => {
    switch (status) {
      case 'ok':
        return '#34C759';
      case 'warning':
        return '#FF9500';
      case 'danger':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusText = (status: 'ok' | 'warning' | 'danger') => {
    switch (status) {
      case 'ok':
        return '順調';
      case 'warning':
        return '注意';
      case 'danger':
        return '危険';
      default:
        return '未設定';
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/goal/${goal.id}`)}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{goal.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(progress.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(progress.status) }]}>
            {getStatusText(progress.status)}
          </Text>
        </View>
      </View>

      {goal.description && (
        <Text style={styles.description} numberOfLines={2}>
          {goal.description}
        </Text>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${Math.max(0, Math.min(100, progress.actualRate * 100))}%` },
              { backgroundColor: getStatusColor(progress.status) },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress.actualRate * 100)}% 完了
        </Text>
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {new Date(goal.start_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })} -{' '}
          {new Date(goal.end_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
});

