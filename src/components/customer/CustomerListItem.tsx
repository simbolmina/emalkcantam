import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  List,
  Text,
  TouchableRipple,
  Avatar,
  IconButton,
} from 'react-native-paper';
import { Customer } from '../../models/Customer';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomerListItemProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export function CustomerListItem({ customer, onPress }: CustomerListItemProps) {
  const getInitials = (customer: Customer) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName[0]}${customer.lastName[0]}`.toUpperCase();
    }
    // Fallback for old data format
    if (customer.name) {
      const parts = customer.name.split(' ');
      return parts
        .map((part: string) => part[0])
        .join('')
        .toUpperCase();
    }
    return 'XX';
  };

  const getDisplayName = (customer: Customer) => {
    if (customer.firstName && customer.lastName) {
      return `${customer.firstName} ${customer.lastName}`;
    }
    // Fallback for old data format
    return customer.name || 'İsimsiz Müşteri';
  };

  return (
    <TouchableRipple onPress={() => onPress(customer)}>
      <List.Item
        title={getDisplayName(customer)}
        description={customer.contactInfo.phone}
        left={(props) => (
          <Avatar.Text {...props} size={40} label={getInitials(customer)} />
        )}
        right={() => (
          <View style={styles.rightContent}>
            <MaterialIcons
              name="star"
              size={16}
              color="#FFD700"
              style={styles.star}
            />
            <Text>{customer.commercialPotential}</Text>
          </View>
        )}
      />
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  avatar: {
    marginRight: 8,
    marginVertical: 8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  star: {
    marginRight: 4,
  },
});
