import { Stack } from 'expo-router';

export default function TradeLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Emlak Detayı' }} />
      <Stack.Screen name="new" options={{ title: 'Yeni Emlak' }} />
    </Stack>
  );
}
