/**
 * Task item component
 * ID: COMP_TASK_ITEM_001
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Task } from '../types/database';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string, done: boolean) => void;
}

export function TaskItem({ task, onToggle }: TaskItemProps) {
  const isDone = task.status === 'done';
  const isDropped = task.status === 'dropped';

  const handleToggle = () => {
    if (!isDropped) {
      onToggle(task.id, !isDone);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isDone && styles.containerDone, isDropped && styles.containerDropped]}
      onPress={handleToggle}
      activeOpacity={0.7}
    >
      <View style={styles.checkbox}>
        {isDone && <View style={styles.checkboxChecked} />}
        {isDropped && <View style={styles.checkboxDropped} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, isDone && styles.titleDone, isDropped && styles.titleDropped]}>
          {task.title}
        </Text>
        {task.description && (
          <Text style={[styles.description, isDone && styles.descriptionDone]}>
            {task.description}
          </Text>
        )}
        {task.due_date && (
          <Text style={styles.dueDate}>
            {new Date(task.due_date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  containerDone: {
    backgroundColor: '#F2F2F7',
    borderColor: '#34C759',
  },
  containerDropped: {
    backgroundColor: '#F2F2F7',
    borderColor: '#8E8E93',
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8E8E93',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
  },
  checkboxDropped: {
    width: 14,
    height: 2,
    backgroundColor: '#8E8E93',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  titleDropped: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  descriptionDone: {
    color: '#8E8E93',
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

