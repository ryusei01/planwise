/**
 * Commitment Badge Component
 * ID: COMP_COMMITMENT_BADGE_001
 * 
 * Displays commitment status on goal cards and detail screens
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GoalCommitment, CommitmentStatus } from '../types/database';

interface CommitmentBadgeProps {
  commitment: GoalCommitment;
  compact?: boolean;
}

export function CommitmentBadge({ commitment, compact = false }: CommitmentBadgeProps) {
  const getStatusInfo = (status: CommitmentStatus) => {
    switch (status) {
      case 'active':
        return { icon: '🔥', label: 'コミット中', color: '#FF9500', bgColor: '#FFF3E0' };
      case 'achieved':
        return { icon: '🎉', label: '達成', color: '#34C759', bgColor: '#E8F5E9' };
      case 'failed':
        return { icon: '💸', label: '未達成', color: '#FF3B30', bgColor: '#FFEBEE' };
      case 'cancelled':
        return { icon: '❌', label: 'キャンセル', color: '#8E8E93', bgColor: '#F5F5F5' };
      default:
        return { icon: '❓', label: '不明', color: '#8E8E93', bgColor: '#F5F5F5' };
    }
  };

  const statusInfo = getStatusInfo(commitment.status);

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: statusInfo.bgColor }]}>
        <Text style={styles.compactIcon}>{statusInfo.icon}</Text>
        <Text style={[styles.compactAmount, { color: statusInfo.color }]}>
          ¥{commitment.amount.toLocaleString()}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: statusInfo.bgColor, borderColor: statusInfo.color }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{statusInfo.icon}</Text>
        <Text style={[styles.label, { color: statusInfo.color }]}>{statusInfo.label}</Text>
      </View>
      <Text style={[styles.amount, { color: statusInfo.color }]}>
        ¥{commitment.amount.toLocaleString()}
      </Text>
      <Text style={styles.threshold}>
        達成基準: {commitment.threshold_percent}%以上
      </Text>
      {commitment.status === 'active' && (
        <Text style={styles.warning}>
          ⚠️ 達成できない場合、この金額が請求されます
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  threshold: {
    fontSize: 12,
    color: '#666',
  },
  warning: {
    fontSize: 12,
    color: '#E65100',
    marginTop: 8,
    lineHeight: 16,
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  compactAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
