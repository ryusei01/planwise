/**
 * Tabs layout
 * ID: LAYOUT_TABS_001
 */
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'ホーム',
          headerTitle: 'ホーム',
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarLabel: '目標',
          headerTitle: '目標一覧',
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarLabel: 'レビュー',
          headerTitle: 'レビュー',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarLabel: '設定',
          headerTitle: '設定',
        }}
      />
    </Tabs>
  );
}

