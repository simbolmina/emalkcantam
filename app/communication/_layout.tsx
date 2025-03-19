import { Stack } from 'expo-router';

export default function CommunicationLayout() {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ title: 'İletişim Detayı' }} />
      <Stack.Screen name="new" options={{ title: 'Yeni İletişim' }} />
    </Stack>
  );
}
