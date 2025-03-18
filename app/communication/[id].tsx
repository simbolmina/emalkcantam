import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CommunicationForm } from '../../src/components/communication/CommunicationForm';
import { communicationStorage } from '../../src/services/communicationStorage';
import { ActivityIndicator } from 'react-native-paper';

export default function EditCommunicationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [communication, setCommunication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCommunication();
  }, [id]);

  const loadCommunication = async () => {
    try {
      const data = await communicationStorage.getById(id as string);
      setCommunication(data);
    } catch (error) {
      console.error('Error loading communication:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      console.log('Updating communication with:', values);
      await communicationStorage.update(id as string, values);
      router.back();
    } catch (error) {
      console.error('Error updating communication:', error);
    } finally {
      setSubmitting(false);
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
    <CommunicationForm
      initialData={communication}
      onSubmit={handleSubmit}
      isLoading={submitting}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
