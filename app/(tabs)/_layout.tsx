import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Panel',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="view-dashboard"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trades"
        options={{
          title: 'İlanlar',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home-city" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Müşteriler',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="communications"
        options={{
          title: 'İletişim',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="message-text"
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
