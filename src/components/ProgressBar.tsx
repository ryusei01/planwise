/**
 * Progress bar component
 * ID: COMP_PROGRESS_BAR_001
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressStatus } from '../lib/progress';

interface ProgressBarProps {
  progress: ProgressStatus;
  showLabels?: boolean;
}

export function ProgressBar({ progress, showLabels = true }: ProgressBarProps) {
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

  const actualPercentage = Math.max(0, Math.min(100, progress.actualRate * 100));
  const idealPercentage = Math.max(0, Math.min(100, progress.idealRate * 100));

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labels}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>実進捗</Text>
            <Text style={styles.value}>{Math.round(actualPercentage)}%</Text>
          </View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>理想進捗</Text>
            <Text style={styles.value}>{Math.round(idealPercentage)}%</Text>
          </View>
          <View style={styles.labelRow}>
            <Text style={styles.label}>乖離</Text>
            <Text style={[styles.value, { color: getStatusColor(progress.status) }]}>
              {progress.gapRate >= 0 ? '+' : ''}
              {Math.round(progress.gapRate * 100)}%
            </Text>
          </View>
        </View>
      )}

      <View style={styles.barContainer}>
        <View style={[styles.bar, { backgroundColor: '#E5E5EA' }]}>
          {/* Ideal progress indicator */}
          <View
            style={[
              styles.idealIndicator,
              { left: `${idealPercentage}%` },
            ]}
          />
          {/* Actual progress fill */}
          <View
            style={[
              styles.progressFill,
              {
                width: `${actualPercentage}%`,
                backgroundColor: getStatusColor(progress.status),
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(progress.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(progress.status) }]}>
            {getStatusText(progress.status)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  barContainer: {
    marginBottom: 8,
  },
  bar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  idealIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#007AFF',
    zIndex: 1,
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

