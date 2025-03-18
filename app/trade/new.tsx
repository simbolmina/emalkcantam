import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Snackbar } from 'react-native-paper';
import { TradeForm } from '../../src/components/trade/TradeForm';
import { Trade } from '../../src/models/Trade';
import { tradeStorage } from '../../src/services/tradeStorage';

export default function NewTradeScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Trade) => {
    setIsLoading(true);
    setError(null);

    try {
      await tradeStorage.add(data);
      router.back();
    } catch (err) {
      setError('İlan kaydedilirken bir hata oluştu.');
      console.error('Error saving trade:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TradeForm onSubmit={handleSubmit} isLoading={isLoading} />
      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        action={{
          label: 'Tamam',
          onPress: () => setError(null),
        }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
