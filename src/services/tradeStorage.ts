import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trade, TradeFormData } from '../models/Trade';

const STORAGE_KEY = '@trades';

export const tradeStorage = {
  async getAll(): Promise<Trade[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading trades:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Trade | null> {
    try {
      const trades = await this.getAll();
      return trades.find((trade) => trade.id === id) || null;
    } catch (error) {
      console.error('Error loading trade:', error);
      return null;
    }
  },

  async getByCustomerId(customerId: string): Promise<Trade[]> {
    try {
      const trades = await this.getAll();
      return trades.filter((trade) => trade.customerId === customerId);
    } catch (error) {
      console.error('Error loading customer trades:', error);
      return [];
    }
  },

  async add(tradeData: TradeFormData): Promise<Trade> {
    try {
      const trades = await this.getAll();
      const newTrade: Trade = {
        ...tradeData,
        id: Date.now().toString(),
        history: tradeData.history || [
          {
            date: new Date().toISOString(),
            action: 'Created',
            notes: 'Trade initiated',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...trades, newTrade])
      );
      return newTrade;
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  },

  async update(
    id: string,
    tradeData: Partial<TradeFormData>
  ): Promise<Trade | null> {
    try {
      const trades = await this.getAll();
      const index = trades.findIndex((trade) => trade.id === id);

      if (index === -1) return null;

      const currentTrade = trades[index];
      const updatedTrade: Trade = {
        ...currentTrade,
        ...tradeData,
        id,
        updatedAt: new Date().toISOString(),
      };

      trades[index] = updatedTrade;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
      return updatedTrade;
    } catch (error) {
      console.error('Error updating trade:', error);
      throw error;
    }
  },

  async addHistoryItem(
    id: string,
    action: string,
    notes: string
  ): Promise<Trade | null> {
    try {
      const trade = await this.getById(id);
      if (!trade) return null;

      const updatedTrade = {
        ...trade,
        history: [
          ...trade.history,
          {
            date: new Date().toISOString(),
            action,
            notes,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      return await this.update(id, updatedTrade);
    } catch (error) {
      console.error('Error adding history item:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const trades = await this.getAll();
      const filteredTrades = trades.filter((trade) => trade.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredTrades));
      return true;
    } catch (error) {
      console.error('Error deleting trade:', error);
      return false;
    }
  },
};
