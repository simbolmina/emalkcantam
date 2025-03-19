import AsyncStorage from '@react-native-async-storage/async-storage';
import { Communication } from '../models/Communication';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = '@communications';

export const communicationStorage = {
  async getAll(): Promise<Communication[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting communications:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Communication | null> {
    try {
      const communications = await this.getAll();
      return communications.find((comm) => comm.id === id) || null;
    } catch (error) {
      console.error('Error getting communication by id:', error);
      return null;
    }
  },

  async getByCustomerId(customerId: string): Promise<Communication[]> {
    try {
      const communications = await this.getAll();
      return communications.filter((comm) => comm.customerId === customerId);
    } catch (error) {
      console.error('Error getting communications by customer id:', error);
      return [];
    }
  },

  async add(
    communication: Omit<Communication, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Communication> {
    const now = new Date().toISOString();
    const newCommunication: Communication = {
      id: uuidv4(),
      ...communication,
      createdAt: now,
      updatedAt: now,
    };

    const communications = await this.getAll();
    communications.push(newCommunication);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(communications));

    return newCommunication;
  },

  async update(id: string, updates: Partial<Communication>): Promise<void> {
    try {
      const communications = await this.getAll();
      const index = communications.findIndex((comm) => comm.id === id);

      if (index !== -1) {
        communications[index] = {
          ...communications[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(communications));
      }
    } catch (error) {
      console.error('Error updating communication:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const communications = await this.getAll();
      const filtered = communications.filter((comm) => comm.id !== id);
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
