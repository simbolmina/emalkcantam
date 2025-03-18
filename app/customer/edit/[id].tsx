import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';
import { CustomerForm } from '../../../src/components/customer/CustomerForm';
import { customerStorage } from '../../../src/services/customerStorage';
import { CustomerFormData } from '../../../src/models/Customer';

const emptyCustomer: CustomerFormData = {
  firstName: '',
  lastName: '',
  customerType: 'buyer',
  contactInfo: {
    phone: '',
    email: '',
    address: '',
    alternativePhone: '',
  },
  hometown: '',
  occupation: '',
  notes: '',
  commercialPotential: 3,
  referredBy: '',
};

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerFormData>(emptyCustomer);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  const loadCustomer = async () => {
    try {
      const data = await customerStorage.getById(id as string);
      if (data) {
        const { id: customerId, createdAt, updatedAt, ...formData } = data;
        setCustomer(formData);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CustomerFormData) => {
    try {
      await customerStorage.update(id as string, values);
      router.back();
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomerForm
        initialValues={customer}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
