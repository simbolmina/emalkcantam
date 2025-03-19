import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CommunicationForm } from '../../src/components/communication/CommunicationForm';
import { communicationStorage } from '../../src/services/communicationStorage';
import { ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Communication } from '../../src/models/Communication';

export default function EditCommunicationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [communication, setCommunication] = useState<Communication | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCommunication();
  }, [id]);

  const loadCommunication = async () => {
    try {
      if (typeof id === 'string') {
        const data = await communicationStorage.getById(id);
        setCommunication(data);
      }
    } catch (error) {
      console.error('Error loading communication:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadCommunication();
    }, [id])
  );

  const handleSubmit = async (
    values: Partial<Communication>
  ): Promise<Communication> => {
    setSubmitting(true);
    try {
      if (typeof id !== 'string') {
        throw new Error('Invalid communication ID');
      }

      if (!communication) {
        throw new Error('No communication found to update');
      }

      console.log('Updating communication with:', values);
      // Merge existing communication with updates to ensure we have a complete object
      const updatedValues = {
        ...communication,
        ...values,
        updatedAt: new Date().toISOString(),
      } as Communication;

      await communicationStorage.update(id, updatedValues);
      router.back();
      return updatedValues; // Return the complete updated communication object
    } catch (error) {
      console.error('Error updating communication:', error);
      throw error;
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

  if (!communication) {
    return (
      <View style={styles.loadingContainer}>
        <Text>İletişim bulunamadı</Text>
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
