import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TradeForm } from '../../../src/components/trade/TradeForm';
import { tradeStorage } from '../../../src/services/tradeStorage';
import { Trade } from '../../../src/models/Trade';

export default function EditTradeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrade();
  }, [id]);

  const loadTrade = async () => {
    if (id) {
      try {
        const data = await tradeStorage.getById(id as string);
        setTrade(data);
      } catch (error) {
        console.error('Error loading trade:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (values: Partial<Trade>) => {
    try {
      await tradeStorage.update(id as string, values);
      router.back();
    } catch (error) {
      console.error('Error updating trade:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!trade) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TradeForm
        initialData={trade}
        onSubmit={handleSubmit}
        isLoading={false}
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
