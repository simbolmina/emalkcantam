import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../src/theme';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../src/services/notificationService';
import { Platform } from 'react-native';

// Configure notifications to ensure they show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function Layout() {
  useEffect(() => {
    // Initialize notifications
    const initNotifications = async () => {
      try {
        // Request permissions
        const { status } = await Notifications.requestPermissionsAsync();
        console.log('Notification permissions status:', status);

        if (status !== 'granted') {
          console.warn('Notification permissions not granted!');
        }

        // Get scheduled notifications for debugging
        const scheduledNotifications =
          await Notifications.getAllScheduledNotificationsAsync();
        console.log(
          `There are ${scheduledNotifications.length} scheduled notifications`
        );

        // Set up notification categories (Android)
        if (Platform.OS === 'android') {
          await notificationService.ensureSetup();
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    initNotifications();

    // Set up notification response handler
    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          'Notification response received:',
          response.notification.request.identifier
        );
        notificationService.handleNotificationResponse(response);
      });

    // Set up notification received handler (for debugging)
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification.request.identifier);
        console.log('Notification content:', notification.request.content);
      }
    );

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
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
