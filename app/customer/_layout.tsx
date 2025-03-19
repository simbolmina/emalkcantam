import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'Müşteri Detayı' }} />
      <Stack.Screen name="edit/[id]" options={{ title: 'Müşteriyi Düzenle' }} />
      <Stack.Screen name="new" options={{ title: 'Yeni Müşteri' }} />
    </Stack>
  );
}
