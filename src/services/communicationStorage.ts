import AsyncStorage from '@react-native-async-storage/async-storage';
import { Communication } from '../models/Communication';
import { generateId } from '../utils/generateId';
import { notificationService } from './notificationService';

const STORAGE_KEY = '@communications';

export const communicationStorage = {
  async getAll(): Promise<Communication[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error('Error reading communications:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Communication | null> {
    try {
      const communications = await this.getAll();
      return communications.find((c) => c.id === id) || null;
    } catch (error) {
      console.error('Error reading communication:', error);
      return null;
    }
  },

  async getByCustomerId(customerId: string): Promise<Communication[]> {
    try {
      const communications = await this.getAll();
      return communications.filter((c) => c.customerId === customerId);
    } catch (error) {
      console.error('Error reading customer communications:', error);
      return [];
    }
  },

  async add(
    data: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    try {
      const communications = await this.getAll();
      const now = new Date().toISOString();
      const newCommunication: Communication = {
        ...data,
        id: Math.random().toString(36).substring(7),
        createdAt: now,
        updatedAt: now,
      };

      // Schedule notification if reminder is set
      if (newCommunication.reminder && !newCommunication.reminder.completed) {
        const notificationId = await notificationService.scheduleNotification(
          'İletişim Hatırlatması',
          `${newCommunication.customerName} - ${newCommunication.reminder.notes}`,
          new Date(newCommunication.reminder.date)
        );
        if (notificationId) {
          newCommunication.reminder.notificationId = notificationId;
        }
      }

      communications.push(newCommunication);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(communications));
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  },

  async update(id: string, data: Partial<Communication>): Promise<void> {
    try {
      const communications = await this.getAll();
      const index = communications.findIndex((c) => c.id === id);
      if (index === -1) return;

      const oldCommunication = communications[index];
      const updatedCommunication: Communication = {
        ...oldCommunication,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      // Handle reminder notifications
      if (oldCommunication.reminder?.notificationId) {
        // Cancel old notification
        await notificationService.cancelNotification(
          oldCommunication.reminder.notificationId
        );
      }

      if (
        updatedCommunication.reminder &&
        !updatedCommunication.reminder.completed
      ) {
        // Schedule new notification
        const notificationId = await notificationService.scheduleNotification(
          'İletişim Hatırlatması',
          `${updatedCommunication.customerName} - ${updatedCommunication.reminder.notes}`,
          new Date(updatedCommunication.reminder.date)
        );
        if (notificationId) {
          updatedCommunication.reminder.notificationId = notificationId;
        }
      }

      communications[index] = updatedCommunication;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(communications));
    } catch (error) {
      console.error('Error updating communication:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const communications = await this.getAll();
      const communication = communications.find((c) => c.id === id);

      // Cancel notification if exists
      if (communication?.reminder?.notificationId) {
        await notificationService.cancelNotification(
          communication.reminder.notificationId
        );
      }

      const filtered = communications.filter((c) => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting communication:', error);
      throw error;
    }
  },

  async getPendingReminders(): Promise<Communication[]> {
    try {
      const communications = await this.getAll();
      return communications.filter(
        (comm) =>
          comm.reminder &&
          !comm.reminder.completed &&
          new Date(comm.reminder.date) >= new Date()
      );
    } catch (error) {
      console.error('Error loading reminders:', error);
      return [];
    }
  },
};
