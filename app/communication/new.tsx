import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CommunicationForm } from '../../src/components/communication/CommunicationForm';
import { communicationStorage } from '../../src/services/communicationStorage';
import {
  Communication,
  CommunicationFormData,
} from '../../src/models/Communication';

export default function NewCommunicationScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    values: CommunicationFormData
  ): Promise<Communication> => {
    setSubmitting(true);
    setError(null);

    try {
      console.log('Creating new communication:', values);
      const newCommunication = await communicationStorage.add(values);
      router.back();
      return newCommunication;
    } catch (error) {
      console.error('Error creating communication:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);
      Alert.alert('Hata', errorMessage);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <CommunicationForm
          initialData={{
            customerId: '',
            customerName: '',
            customerPhone: '',
            type: 'call',
            date: new Date().toISOString(),
            notes: '',
          }}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CommunicationForm
        initialData={{
          customerId: '',
          customerName: '',
          customerPhone: '',
          type: 'call',
          date: new Date().toISOString(),
          notes: '',
        }}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
