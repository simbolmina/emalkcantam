import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface RatingProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  maxStars?: number;
}

export function Rating({ label, value, onChange, maxStars = 5 }: RatingProps) {
  return (
    <View>
      <Text variant="titleMedium">{label}</Text>
      <View style={styles.starsContainer}>
        {[...Array(maxStars)].map((_, index) => (
          <TouchableOpacity key={index} onPress={() => onChange(index + 1)}>
            <MaterialIcons
              name="star"
              size={32}
              color={index < value ? '#FFD700' : '#E0E0E0'}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  starsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  star: {
    marginRight: 8,
  },
});
