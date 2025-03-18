import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, CustomerFormData } from '../models/Customer';

const STORAGE_KEY = '@customers';

export const customerStorage = {
  async getAll(): Promise<Customer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('Raw storage data:', data);
      const customers = data ? JSON.parse(data) : [];

      // Migrate old data format to new format
      const migratedCustomers = customers.map((customer: any) => {
        if (customer.name && (!customer.firstName || !customer.lastName)) {
          console.log('Migrating customer:', customer.id);
          const nameParts = customer.name.split(' ');
          const lastName = nameParts.pop() || '';
          const firstName = nameParts.join(' ');

          return {
            ...customer,
            firstName: firstName || 'Unknown',
            lastName: lastName || 'Unknown',
          };
        }
        return customer;
      });

      // Save migrated data back to storage if there were any migrations
      if (JSON.stringify(customers) !== JSON.stringify(migratedCustomers)) {
        console.log('Saving migrated customers');
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(migratedCustomers)
        );
      }

      return migratedCustomers;
    } catch (error) {
      console.error('Error loading customers:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Customer | null> {
    try {
      const customers = await this.getAll();
      return customers.find((customer) => customer.id === id) || null;
    } catch (error) {
      console.error('Error loading customer:', error);
      return null;
    }
  },

  async add(customerData: CustomerFormData): Promise<Customer> {
    try {
      const customers = await this.getAll();
      const newCustomer: Customer = {
        ...customerData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedCustomers = [...customers, newCustomer];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));
      console.log('Added new customer:', newCustomer); // Debug log
      console.log('Updated storage:', await this.getAll()); // Debug log
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  },

  async update(
    id: string,
    customerData: CustomerFormData
  ): Promise<Customer | null> {
    try {
      const customers = await this.getAll();
      const index = customers.findIndex((customer) => customer.id === id);

      if (index === -1) return null;

      const updatedCustomer: Customer = {
        ...customerData,
        id,
        createdAt: customers[index].createdAt,
        updatedAt: new Date().toISOString(),
      };

      customers[index] = updatedCustomer;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
      console.log('Updated customer:', updatedCustomer); // Debug log
      return updatedCustomer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const customers = await this.getAll();
      const filteredCustomers = customers.filter(
        (customer) => customer.id !== id
      );
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(filteredCustomers)
      );
      console.log('Deleted customer:', id); // Debug log
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      return false;
    }
  },

  // Debug helper
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('Cleared all customers data');
    } catch (error) {
      console.error('Error clearing customers:', error);
    }
  },
};
