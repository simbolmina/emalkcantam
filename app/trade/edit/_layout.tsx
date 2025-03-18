import { Stack } from 'expo-router';

export default function EditTradeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Emlak Düzenle',
        }}
      />
    </Stack>
  );
}
