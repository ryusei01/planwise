/**
 * Root layout for Expo Router
 * ID: LAYOUT_ROOT_001
 */
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="goal/[id]" options={{ presentation: 'card', headerShown: true, title: '目標詳細' }} />
    </Stack>
  );
}

