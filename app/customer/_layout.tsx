import { Stack } from 'expo-router';

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Müşteri Detayları',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'Yeni Müşteri',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          title: 'Müşteri Düzenle',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
