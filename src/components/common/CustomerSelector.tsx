import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Dimensions } from 'react-native';
import {
  Modal,
  Portal,
  Text,
  Searchbar,
  List,
  Divider,
  TouchableRipple,
  ActivityIndicator,
  IconButton,
  Card,
  Surface,
} from 'react-native-paper';
import { Customer } from '../../models/Customer';
import { customerStorage } from '../../services/customerStorage';

interface CustomerSelectorProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (customer: Customer) => void;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  visible,
  onDismiss,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadCustomers();
    }
  }, [visible]);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerStorage.getAll();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    const query = searchQuery.toLowerCase();
    const filtered = customers.filter(
      (customer) =>
        `${customer.firstName} ${customer.lastName}`
          .toLowerCase()
          .includes(query) ||
        customer.contactInfo.phone.includes(query) ||
        (customer.contactInfo.email &&
          customer.contactInfo.email.toLowerCase().includes(query))
    );
    setFilteredCustomers(filtered);
  };

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    onDismiss();
    setSearchQuery('');
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modal,
          {
            transform: [
              { translateY: visible ? 0 : Dimensions.get('window').height },
            ],
          },
        ]}
      >
        <Surface style={styles.surface} elevation={5}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text variant="titleLarge">Müşteri Seç</Text>
            <IconButton icon="close" onPress={onDismiss} />
          </View>
          <Searchbar
            placeholder="Müşteri ara..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />
          {loading ? (
            <ActivityIndicator style={styles.loading} />
          ) : filteredCustomers.length === 0 ? (
            <Text style={styles.emptyText}>
              {searchQuery ? 'Müşteri bulunamadı' : 'Henüz müşteri eklenmemiş'}
            </Text>
          ) : (
            <View style={styles.listContainer}>
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item.id}
                renderItem={({ item: customer }) => (
                  <TouchableRipple onPress={() => handleSelect(customer)}>
                    <List.Item
                      title={`${customer.firstName} ${customer.lastName}`}
                      description={customer.contactInfo.phone}
                      left={(props) => <List.Icon {...props} icon="account" />}
                      right={(props) => (
                        <List.Icon {...props} icon="chevron-right" />
                      )}
                    />
                  </TouchableRipple>
                )}
                ItemSeparatorComponent={Divider}
              />
            </View>
          )}
        </Surface>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  surface: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    maxHeight: Dimensions.get('window').height * 0.6,
  },
  loading: {
    margin: 20,
  },
  emptyText: {
    textAlign: 'center',
    margin: 20,
    opacity: 0.7,
  },
});
