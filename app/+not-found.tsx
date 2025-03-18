import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Page Not Found
      </Text>
      <Text variant="bodyLarge" style={styles.message}>
        The page you're looking for doesn't exist or has been moved.
      </Text>
      <Button
        mode="contained"
        onPress={() => router.replace('/')}
        style={styles.button}
      >
        Go to Home
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    minWidth: 120,
  },
});
