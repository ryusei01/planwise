/**
 * Create goal modal component
 * ID: COMP_CREATE_GOAL_001
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { goalRepository, CreateGoalParams } from '../repositories/goal.repository';
import { commitmentRepository } from '../repositories/commitment.repository';
import { PeriodType } from '../types/database';
import { CommitmentSetup } from './CommitmentSetup';

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGoalModal({ visible, onClose, onSuccess }: CreateGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [loading, setLoading] = useState(false);
  const [commitmentAmount, setCommitmentAmount] = useState<number | null>(null);
  const [commitmentThreshold, setCommitmentThreshold] = useState<number>(100);

  const handleCommitmentChange = (amount: number | null, threshold: number) => {
    setCommitmentAmount(amount);
    setCommitmentThreshold(threshold);
  };

  // Calculate default dates based on period type
  const getDefaultDates = (type: PeriodType): { start: string; end: string } => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1); // First day of current month
    let end: Date;

    if (type === 'year') {
      end = new Date(today.getFullYear(), 11, 31); // Last day of current year
    } else {
      // month
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return;
    }

    setLoading(true);
    try {
      const dates = getDefaultDates(periodType);
      const params: CreateGoalParams = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        period_type: periodType,
        start_date: dates.start,
        end_date: dates.end,
      };

      const result = await goalRepository.createGoalWithInitialPlan(params);

      // Create commitment if set
      if (commitmentAmount && commitmentAmount > 0) {
        try {
          await commitmentRepository.createCommitment({
            goal_id: result.goal_id,
            amount: commitmentAmount,
            threshold_percent: commitmentThreshold,
          });
        } catch (commitmentError) {
          console.warn('Failed to create commitment:', commitmentError);
          // Continue even if commitment creation fails
        }
      }

      const successMessage = commitmentAmount 
        ? `目標を作成しました。コミットメント: ¥${commitmentAmount.toLocaleString()}`
        : '目標を作成しました';

      Alert.alert('成功', successMessage, [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('エラー', error.message || '目標の作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPeriodType('month');
    setCommitmentAmount(null);
    setCommitmentThreshold(100);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>目標を作成</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Text style={styles.closeButton}>閉じる</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>タイトル *</Text>
              <TextInput
                style={styles.input}
                placeholder="目標のタイトル"
                value={title}
                onChangeText={setTitle}
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>説明</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="目標の説明（任意）"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>カテゴリ</Text>
              <TextInput
                style={styles.input}
                placeholder="カテゴリ（任意）"
                value={category}
                onChangeText={setCategory}
                editable={!loading}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>期間タイプ</Text>
              <View style={styles.periodTypeContainer}>
                <TouchableOpacity
                  style={[
                    styles.periodTypeButton,
                    periodType === 'month' && styles.periodTypeButtonActive,
                  ]}
                  onPress={() => setPeriodType('month')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.periodTypeText,
                      periodType === 'month' && styles.periodTypeTextActive,
                    ]}
                  >
                    月単位
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodTypeButton,
                    periodType === 'year' && styles.periodTypeButtonActive,
                  ]}
                  onPress={() => setPeriodType('year')}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.periodTypeText,
                      periodType === 'year' && styles.periodTypeTextActive,
                    ]}
                  >
                    年単位
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Commitment Setup (Mezamee-style) */}
            <CommitmentSetup onCommitmentChange={handleCommitmentChange} />

            <TouchableOpacity
              style={[styles.createButton, loading && styles.createButtonDisabled]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.createButtonText}>作成</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  form: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  periodTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  periodTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  periodTypeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF20',
  },
  periodTypeText: {
    fontSize: 16,
    color: '#666',
  },
  periodTypeTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

