import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../src/theme';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../src/services/notificationService';

export default function Layout() {
  useEffect(() => {
    // Set up notification response handler
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        notificationService.handleNotificationResponse(response);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
