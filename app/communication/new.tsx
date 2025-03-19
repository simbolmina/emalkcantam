import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CommunicationForm } from '../../src/components/communication/CommunicationForm';
import { communicationStorage } from '../../src/services/communicationStorage';
import { Communication } from '../../src/models/Communication';

export default function NewCommunicationScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any): Promise<Communication> => {
    setSubmitting(true);
    try {
      console.log('Creating new communication:', values);
      const newCommunication = await communicationStorage.add(values);
      router.back();
      return newCommunication;
    } catch (error) {
      console.error('Error creating communication:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <CommunicationForm onSubmit={handleSubmit} isLoading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
