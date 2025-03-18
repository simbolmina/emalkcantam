import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CustomerForm } from '../../src/components/customer/CustomerForm';
import { customerStorage } from '../../src/services/customerStorage';
import { CustomerFormData } from '../../src/models/Customer';

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

export default function NewCustomerScreen() {
  const router = useRouter();

  const handleSubmit = async (values: CustomerFormData) => {
    try {
      await customerStorage.add(values);
      router.back();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  return (
    <View style={styles.container}>
      <CustomerForm
        initialValues={emptyCustomer}
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
});
