/**
 * Root index - handles initial routing based on auth state
 * ID: INDEX_ROOT_001
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { authRepository } from '../src/repositories/auth.repository';
import { Session } from '@supabase/supabase-js';

export default function Index() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session and redirect
    authRepository.getSession().then((session) => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
      setLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = authRepository.onAuthStateChange((session) => {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}

