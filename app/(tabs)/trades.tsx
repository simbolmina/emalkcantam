import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  Searchbar,
  FAB,
  ActivityIndicator,
  Chip,
  Text,
  TouchableRipple,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { Trade, PropertyType, TradeStatus } from '../../src/models/Trade';
import { tradeStorage } from '../../src/services/tradeStorage';

export default function TradesScreen() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PropertyType | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TradeStatus | null>(
    null
  );
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadTrades();
    }, [])
  );

  const loadTrades = async () => {
    try {
      const data = await tradeStorage.getAll();
      setTrades(data);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes: PropertyType[] = [
    'house',
    'apartment',
    'land',
    'commercial',
    // 'other',
  ];
  const tradeStatuses: TradeStatus[] = [
    'active',
    'pending',
    'sold',
    'cancelled',
    'archived',
  ];

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch =
      trade.propertyDetails.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      trade.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.propertyDetails.location.address
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType = selectedType
      ? trade.propertyType === selectedType
      : true;
    const matchesStatus = selectedStatus
      ? trade.status === selectedStatus
      : true;

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    });
  };

  const getPropertyTypeLabel = (type: PropertyType) => {
    const labels: Record<PropertyType, string> = {
      house: 'Müstakil',
      apartment: 'Daire',
      land: 'Arsa',
      commercial: 'İş Yeri',
      // other: 'Diğer',
    };
    return labels[type];
  };

  const getStatusLabel = (status: TradeStatus) => {
    const labels: Record<TradeStatus, string> = {
      active: 'Aktif',
      pending: 'Bekleyen',
      sold: 'Satılmış',
      cancelled: 'İptal',
      archived: 'Arşiv',
    };
    return labels[status];
  };

  const renderTradeItem = ({ item }: { item: Trade }) => (
    <TouchableRipple onPress={() => router.push(`/trade/${item.id}`)}>
      <View style={styles.tradeCard}>
        <Text variant="titleMedium">{item.propertyDetails.title}</Text>
        <Pressable onPress={() => router.push(`/customer/${item.ownerId}`)}>
          <Text variant="bodyMedium" style={styles.customerLink}>
            Müşteri: {item.ownerName}
          </Text>
        </Pressable>
        <Text variant="bodyMedium">
          Fiyat: {formatPrice(item.propertyDetails.price)}
        </Text>
        <Text variant="bodyMedium">Alan: {item.propertyDetails.area}m²</Text>
        <View style={styles.tagContainer}>
          <Chip
            compact
            mode="outlined"
            style={styles.chipStyle}
            textStyle={styles.chipText}
          >
            {getPropertyTypeLabel(item.propertyType)}
          </Chip>
          <Chip
            compact
            mode="outlined"
            style={styles.chipStyle}
            textStyle={styles.chipText}
          >
            {getStatusLabel(item.status)}
          </Chip>
        </View>
      </View>
    </TouchableRipple>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Emlak ara..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {propertyTypes.map((type) => (
            <Chip
              key={type}
              selected={selectedType === type}
              onPress={() =>
                setSelectedType(selectedType === type ? null : type)
              }
              style={styles.filterChip}
            >
              {getPropertyTypeLabel(type)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tradeStatuses.map((status) => (
            <Chip
              key={status}
              selected={selectedStatus === status}
              onPress={() =>
                setSelectedStatus(selectedStatus === status ? null : status)
              }
              style={styles.filterChip}
            >
              {getStatusLabel(status)}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredTrades}
        renderItem={renderTradeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text>Kayıtlı emlak bulunamadı</Text>
          </View>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/trade/new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
  },
  tradeCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  chipStyle: {
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  customerLink: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});
