/**
 * Commitment Setup Component
 * ID: COMP_COMMITMENT_SETUP_001
 * 
 * Allows users to set a commitment amount for their goal (Mezamee-style)
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';

interface CommitmentSetupProps {
  onCommitmentChange: (amount: number | null, threshold: number) => void;
}

const PRESET_AMOUNTS = [500, 1000, 3000, 5000, 10000];
const PRESET_THRESHOLDS = [
  { value: 100, label: '100%（完全達成）' },
  { value: 80, label: '80%以上' },
  { value: 50, label: '50%以上' },
];

export function CommitmentSetup({ onCommitmentChange }: CommitmentSetupProps) {
  const [enabled, setEnabled] = useState(false);
  const [amount, setAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState('');
  const [threshold, setThreshold] = useState<number>(100);

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    if (value) {
      onCommitmentChange(amount, threshold);
    } else {
      onCommitmentChange(null, threshold);
    }
  };

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setCustomAmount('');
    if (enabled) {
      onCommitmentChange(value, threshold);
    }
  };

  const handleCustomAmount = (text: string) => {
    setCustomAmount(text);
    const value = parseInt(text, 10);
    if (!isNaN(value) && value > 0) {
      setAmount(value);
      if (enabled) {
        onCommitmentChange(value, threshold);
      }
    }
  };

  const handleThresholdSelect = (value: number) => {
    setThreshold(value);
    if (enabled) {
      onCommitmentChange(amount, value);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>🔥 コミットメント</Text>
          <Text style={styles.subtitle}>達成できなければ課金</Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#E5E5EA', true: '#FF9500' }}
        />
      </View>

      {enabled && (
        <View style={styles.content}>
          <Text style={styles.description}>
            目標を達成できなかった場合、設定した金額が請求されます。
            自分を追い込んで目標達成率を上げましょう！
          </Text>

          <Text style={styles.sectionTitle}>コミット金額</Text>
          <View style={styles.amountGrid}>
            {PRESET_AMOUNTS.map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.amountButton,
                  amount === value && !customAmount && styles.amountButtonActive,
                ]}
                onPress={() => handleAmountSelect(value)}
              >
                <Text
                  style={[
                    styles.amountButtonText,
                    amount === value && !customAmount && styles.amountButtonTextActive,
                  ]}
                >
                  ¥{value.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.customInput}
            placeholder="カスタム金額（円）"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={handleCustomAmount}
          />

          <Text style={styles.sectionTitle}>達成基準</Text>
          {PRESET_THRESHOLDS.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.thresholdButton,
                threshold === item.value && styles.thresholdButtonActive,
              ]}
              onPress={() => handleThresholdSelect(item.value)}
            >
              <Text
                style={[
                  styles.thresholdText,
                  threshold === item.value && styles.thresholdTextActive,
                ]}
              >
                {threshold === item.value ? '● ' : '○ '}
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.warningBox}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              期限までにタスクを{threshold}%以上完了しないと、¥{amount.toLocaleString()}が請求されます
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#FF9800',
  },
  content: {
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  amountButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    margin: 4,
  },
  amountButtonActive: {
    backgroundColor: '#FF9500',
    borderColor: '#FF9500',
  },
  amountButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  amountButtonTextActive: {
    color: '#fff',
  },
  customInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
  },
  thresholdButton: {
    paddingVertical: 8,
  },
  thresholdButtonActive: {},
  thresholdText: {
    fontSize: 16,
    color: '#666',
  },
  thresholdTextActive: {
    color: '#FF9500',
    fontWeight: '500',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
});
