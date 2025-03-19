import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import { Platform, Alert } from 'react-native';
import { notificationService } from '../src/services/notificationService';

// Configure notifications for when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export default function RootLayout() {
  useEffect(() => {
    async function initApp() {
      try {
        // Request notification permissions early
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        const { status } = await Notifications.requestPermissionsAsync();
        console.log('Notification permissions status:', status);

        // Set up notification response handler
        const responseSubscription =
          Notifications.addNotificationResponseReceivedListener(
            notificationService.handleNotificationResponse
          );

        // For debugging
        const receivedSubscription =
          Notifications.addNotificationReceivedListener((notification) => {
            console.log(
              'Received notification:',
              notification.request.identifier
            );
          });

        return () => {
          responseSubscription.remove();
          receivedSubscription.remove();
        };
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    }

    initApp();
  }, []);

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
