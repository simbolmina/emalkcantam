import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { CommunicationForm } from '../../src/components/communication/CommunicationForm';
import { communicationStorage } from '../../src/services/communicationStorage';
import {
  Communication,
  CommunicationFormData,
  CommunicationType,
} from '../../src/models/Communication';
import { ActivityIndicator } from 'react-native-paper';

export default function NewCommunicationScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('NewCommunicationScreen mounted');
    return () => {
      console.log('NewCommunicationScreen unmounted');
    };
  }, []);

  const handleSubmit = async (
    values: CommunicationFormData
  ): Promise<Communication> => {
    console.log(
      'handleSubmit started with values:',
      JSON.stringify(values, null, 2)
    );
    setSubmitting(true);
    setError(null);

    try {
      console.log('Attempting to create new communication...');
      const newCommunication = await communicationStorage.add(values);
      console.log(
        'Successfully created communication:',
        JSON.stringify(newCommunication, null, 2)
      );
      router.back();
      return newCommunication;
    } catch (error) {
      console.error('Detailed error creating communication:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage =
        error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      setError(errorMessage);
      Alert.alert('Hata', errorMessage);
      throw error;
    } finally {
      console.log('handleSubmit completed, submitting state:', submitting);
      setSubmitting(false);
    }
  };

  console.log('Rendering NewCommunicationScreen', {
    submitting,
    error,
  });

  const initialData: Partial<Communication> = {
    customerId: '',
    customerName: '',
    customerPhone: '',
    type: 'call' as CommunicationType,
    date: new Date().toISOString(),
    notes: '',
  };

  return (
    <View style={styles.container}>
      <CommunicationForm
        initialData={initialData}
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
