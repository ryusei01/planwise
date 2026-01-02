/**
 * Settings screen
 * ID: SCREEN_SETTINGS_001
 */
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { authRepository } from '../../src/repositories/auth.repository';
import { subscriptionRepository } from '../../src/repositories/subscription.repository';
import { Subscription, SubscriptionStatus } from '../../src/types/database';

export default function SettingsScreen() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const sub = await subscriptionRepository.getSubscription();
      setSubscription(sub);
    } catch (error: any) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: SubscriptionStatus | undefined): string => {
    if (!status) return '無料プラン';
    switch (status) {
      case 'active':
        return '有料プラン（アクティブ）';
      case 'trialing':
        return '有料プラン（トライアル中）';
      case 'canceled':
        return '有料プラン（キャンセル済み）';
      case 'expired':
        return '有料プラン（期限切れ）';
      default:
        return '無料プラン';
    }
  };

  const getStatusColor = (status: SubscriptionStatus | undefined): string => {
    if (!status) return '#8E8E93';
    switch (status) {
      case 'active':
      case 'trialing':
        return '#34C759';
      case 'canceled':
      case 'expired':
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  const handleSignOut = async () => {
    Alert.alert('サインアウト', 'サインアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'サインアウト',
        style: 'destructive',
        onPress: async () => {
          try {
            await authRepository.signOut();
            router.replace('/(auth)/login');
          } catch (error: any) {
            Alert.alert('エラー', error.message || 'サインアウトに失敗しました');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>設定</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>サブスクリプション</Text>
          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <>
              <Text style={[styles.sectionText, { color: getStatusColor(subscription?.status) }]}>
                {getStatusText(subscription?.status)}
              </Text>
              {subscription?.current_period_end && (
                <Text style={styles.sectionSubtext}>
                  次回更新日: {new Date(subscription.current_period_end).toLocaleDateString('ja-JP')}
                </Text>
              )}
              {!subscription && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => {
                    // TODO(#SETTINGS_002): 課金導線を実装
                    Alert.alert('情報', '課金導線は今後実装予定です');
                  }}
                >
                  <Text style={styles.upgradeButtonText}>有料プランにアップグレード</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>サインアウト</Text>
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  upgradeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

