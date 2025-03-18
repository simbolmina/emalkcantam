import { Stack } from 'expo-router';

export default function TradeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="new"
        options={{
          title: 'Yeni Emlak',
          presentation: 'modal',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Emlak Detayları',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
