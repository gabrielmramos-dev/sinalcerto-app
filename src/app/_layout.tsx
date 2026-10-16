import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppStateProvider } from '@/state/AppState';

export default function RootLayout() {
  return (
    <AppStateProvider>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="local" options={{ presentation: 'modal', title: 'Escolher local' }} />
      </Stack>
    </AppStateProvider>
  );
}
