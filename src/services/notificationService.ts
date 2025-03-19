import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

// Configure notifications with interaction handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
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

// Define the trigger type enum if not exported by expo-notifications
enum SchedulableTriggerInputTypes {
  DATE = 'date',
}

interface NotificationData {
  communicationId: string;
  customerId: string;
  customerPhone: string;
  type: 'reminder';
}

export const notificationService = {
  async setupNotificationCategories() {
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
  },

  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleNotification(
    title: string,
    body: string,
    date: Date,
    data: NotificationData
  ) {
    try {
      // Request permissions if not already granted
      await this.requestPermissions();

      // Ensure categories are set up
      await this.setupNotificationCategories();

      // Schedule the notification
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'reminder',
        },
        trigger: {
          date,
          channelId: 'default',
        },
      });

      return identifier;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  },

  async handleNotificationResponse(
    response: Notifications.NotificationResponse
  ) {
    const data = response.notification.request.content.data as NotificationData;

    if (!data) return;

    const { communicationId, customerPhone } = data;
    const actionId = response.actionIdentifier;

    // Format phone number for WhatsApp
    const formatPhoneForWhatsApp = (phone: string) => {
      const formattedNumber = phone.replace(/\D/g, '');
      return formattedNumber.startsWith('90')
        ? formattedNumber
        : `90${formattedNumber}`;
    };

    switch (actionId) {
      case NOTIFICATION_ACTIONS.OPEN:
        await Linking.openURL(`emlakcantam://communication/${communicationId}`);
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
        await Linking.openURL(`emlakcantam://communication/${communicationId}`);
        break;
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
