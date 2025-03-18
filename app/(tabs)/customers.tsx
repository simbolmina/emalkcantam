import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ScrollView } from 'react-native';
import {
  Searchbar,
  FAB,
  ActivityIndicator,
  Text,
  Chip,
} from 'react-native-paper';
import { CustomerListItem } from '../../src/components/customer/CustomerListItem';
import { customerStorage } from '../../src/services/customerStorage';
import { Customer } from '../../src/models/Customer';
import { useRouter, useFocusEffect } from 'expo-router';

const CustomerTypeLabels = {
  buyer: 'Alıcı',
  seller: 'Satıcı',
  both: 'Alıcı/Satıcı',
};

type CustomerType = 'buyer' | 'seller' | 'both';

export default function CustomersScreen() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<CustomerType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [])
  );

  const loadCustomers = async () => {
    try {
      const data = await customerStorage.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchLower) ||
      customer.contactInfo.phone.includes(searchQuery) ||
      (customer.contactInfo.email?.toLowerCase() || '').includes(searchLower) ||
      (customer.hometown?.toLowerCase() || '').includes(searchLower);

    const matchesType = selectedType
      ? customer.customerType === selectedType
      : true;

    return matchesSearch && matchesType;
  });

  const handleCustomerPress = (customer: Customer) => {
    router.push(`/customer/${customer.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Müşteri ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {(Object.entries(CustomerTypeLabels) as [CustomerType, string][]).map(
            ([type, label]) => (
              <Chip
                key={type}
                selected={selectedType === type}
                onPress={() =>
                  setSelectedType(selectedType === type ? null : type)
                }
                style={[
                  styles.filterChip,
                  selectedType === type && styles.selectedChip,
                ]}
                textStyle={[selectedType === type && styles.selectedChipText]}
                mode={selectedType === type ? 'flat' : 'outlined'}
                showSelectedCheck={false}
              >
                {label}
              </Chip>
            )
          )}
        </ScrollView>
        <View style={styles.statsContainer}>
          <Text variant="bodySmall">Toplam Müşteri: {customers.length}</Text>
          <Text variant="bodySmall">
            Filtrelenen: {filteredCustomers.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerListItem customer={item} onPress={handleCustomerPress} />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">Müşteri bulunamadı</Text>
            <Text variant="bodySmall" style={styles.emptySubtext}>
              Yeni müşteri eklemek için sağ alttaki + butonuna tıklayın
            </Text>
          </View>
        )}
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/customer/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
    marginBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterContent: {
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
    borderRadius: 20,
  },
  selectedChip: {
    backgroundColor: '#2196F3',
  },
  selectedChipText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  emptySubtext: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.7,
  },
});
