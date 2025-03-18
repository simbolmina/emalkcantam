import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { CommunicationForm } from '../../src/components/communication/CommunicationForm';
import { communicationStorage } from '../../src/services/communicationStorage';
import { CommunicationFormData } from '../../src/models/Communication';

export default function NewCommunicationScreen() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      console.log('Creating new communication:', values);
      await communicationStorage.add(values);
      router.back();
    } catch (error) {
      console.error('Error creating communication:', error);
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
