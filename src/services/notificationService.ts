import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { communicationStorage } from './communicationStorage';

// Configure notifications with interaction handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

// Define action types
export const NOTIFICATION_ACTIONS = {
  OPEN: 'OPEN',
  CALL: 'CALL',
  MESSAGE: 'MESSAGE',
  WHATSAPP: 'WHATSAPP',
  SNOOZE_15: 'SNOOZE_15',
  SNOOZE_30: 'SNOOZE_30',
  SNOOZE_60: 'SNOOZE_60',
  COMPLETE: 'COMPLETE',
} as const;

// Define the trigger type enum
const TriggerType = {
  TIME_INTERVAL: 'timeInterval',
} as const;

interface NotificationData {
  communicationId: string;
  customerId: string;
  customerPhone: string;
  type: 'reminder';
}

let isSetupComplete = false;

export const notificationService = {
  async ensureSetup() {
    if (isSetupComplete) return true;

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Setup categories only on Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationCategoryAsync('reminder', [
          {
            identifier: NOTIFICATION_ACTIONS.OPEN,
            buttonTitle: 'Görüntüle',
          },
          {
            identifier: NOTIFICATION_ACTIONS.CALL,
            buttonTitle: 'Ara',
          },
          {
            identifier: NOTIFICATION_ACTIONS.WHATSAPP,
            buttonTitle: 'WhatsApp',
          },
          {
            identifier: NOTIFICATION_ACTIONS.SNOOZE_30,
            buttonTitle: '30dk Ertele',
          },
        ]);
      }

      isSetupComplete = true;
      return true;
    } catch (error) {
      console.error('Error setting up notifications:', error);
      return false;
    }
  },

  async scheduleNotification(
    title: string,
    body: string,
    date: Date,
    data: NotificationData
  ) {
    try {
      // Ensure setup is complete
      const isReady = await this.ensureSetup();
      if (!isReady) {
        console.log('Notification setup failed, skipping notification');
        return null;
      }

      // Calculate time until notification
      const now = new Date();
      const targetTime = new Date(date);

      // Log scheduling attempt
      console.log('Attempting to schedule notification:');
      console.log('Current time:', now.toLocaleString());
      console.log('Target time:', targetTime.toLocaleString());

      // Ensure the target time is in the future
      if (targetTime <= now) {
        console.warn('Target time is in the past, skipping notification');
        return null;
      }

      // Calculate seconds until notification (minimum 2 minutes)
      const secondsUntilNotification = Math.max(
        120,
        Math.floor((targetTime.getTime() - now.getTime()) / 1000)
      );

      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Create a promise that resolves when the notification should be shown
      const notificationPromise = new Promise<string>((resolve) => {
        setTimeout(async () => {
          try {
            const id = await Notifications.scheduleNotificationAsync({
              content: {
                title,
                body,
                data,
                sound: true,
              },
              trigger: null, // Show immediately when the timeout completes
            });
            resolve(id);
          } catch (error) {
            console.error('Error showing notification:', error);
            resolve('');
          }
        }, secondsUntilNotification * 1000);
      });

      // Return a temporary ID immediately
      const tempId = `temp-${Date.now()}`;
      console.log('Scheduled notification with temp ID:', tempId);
      console.log('Will show in:', secondsUntilNotification, 'seconds');
      console.log(
        'Expected time:',
        new Date(
          now.getTime() + secondsUntilNotification * 1000
        ).toLocaleString()
      );

      // Start the timer but don't wait for it
      notificationPromise.then((finalId) => {
        if (finalId) {
          console.log('Notification shown with final ID:', finalId);
        }
      });

      return tempId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    try {
      const data = response.notification.request.content
        .data as NotificationData;
      if (!data) return;

      const { communicationId, customerPhone } = data;
      const actionId = response.actionIdentifier;

      // Mark the reminder as completed
      try {
        const communication = await communicationStorage.getById(
          communicationId
        );
        if (communication && communication.reminder) {
          communication.reminder.completed = true;
          await communicationStorage.update(communicationId, communication);
          console.log(
            'Marked reminder as completed for communication:',
            communicationId
          );
        }
      } catch (error) {
        console.error('Error marking reminder as completed:', error);
      }

      // Format phone number for WhatsApp
      const formatPhoneForWhatsApp = (phone: string) => {
        const formattedNumber = phone.replace(/\D/g, '');
        return formattedNumber.startsWith('90')
          ? formattedNumber
          : `90${formattedNumber}`;
      };

      switch (actionId) {
        case NOTIFICATION_ACTIONS.OPEN:
          await Linking.openURL(
            `emlakcantam://communication/${communicationId}`
          );
          break;

        case NOTIFICATION_ACTIONS.CALL:
          await Linking.openURL(`tel:${customerPhone}`);
          break;

        case NOTIFICATION_ACTIONS.WHATSAPP:
          await Linking.openURL(
            `whatsapp://send?phone=${formatPhoneForWhatsApp(customerPhone)}`
          );
          break;

        case NOTIFICATION_ACTIONS.SNOOZE_15:
        case NOTIFICATION_ACTIONS.SNOOZE_30:
        case NOTIFICATION_ACTIONS.SNOOZE_60:
          const minutes = parseInt(actionId.split('_')[1]);
          const newDate = new Date(Date.now() + minutes * 60 * 1000);
          await this.scheduleNotification(
            response.notification.request.content.title || '',
            response.notification.request.content.body || '',
            newDate,
            data
          );
          break;

        // Default case (user tapped notification without selecting action)
        default:
          await Linking.openURL(
            `emlakcantam://communication/${communicationId}`
          );
          break;
      }
    } catch (error) {
      console.error('Error handling notification response:', error);
    }
  },

  async cancelNotification(identifier: string) {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  },

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  },
};
