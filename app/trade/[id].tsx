import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  Card,
  List,
  ActivityIndicator,
  Button,
  Divider,
  IconButton,
  TouchableRipple,
} from 'react-native-paper';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Trade, PropertyType } from '../../src/models/Trade';
import { tradeStorage } from '../../src/services/tradeStorage';

const PropertyTypeLabels: Record<PropertyType, string> = {
  house: 'Müstakil',
  apartment: 'Daire',
  land: 'Arsa',
  commercial: 'İş Yeri',
  // other: 'Diğer',
};

const HeatingLabels: Record<string, string> = {
  dogalgaz: 'Doğalgaz',
  merkezi: 'Merkezi',
  kombi: 'Kombi',
  soba: 'Soba',
  klima: 'Klima',
  other: 'Diğer',
};

const FacadeLabels: Record<string, string> = {
  kuzey: 'Kuzey',
  guney: 'Güney',
  dogu: 'Doğu',
  bati: 'Batı',
  other: 'Diğer',
};

export default function TradeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadTrade();
    }, [id])
  );

  const loadTrade = async () => {
    if (id) {
      try {
        const data = await tradeStorage.getById(id as string);
        setTrade(data);
      } catch (error) {
        console.error('Error loading trade:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleDelete = async () => {
    if (trade) {
      await tradeStorage.delete(trade.id);
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!trade) {
    return (
      <View style={styles.container}>
        <Text>İlan bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={trade.propertyDetails.title}
          subtitle={PropertyTypeLabels[trade.propertyType]}
          right={(props) => (
            <View style={styles.headerButtons}>
              <IconButton
                {...props}
                icon="pencil"
                onPress={() => router.push(`/trade/edit/${trade.id}`)}
              />
              <IconButton
                {...props}
                icon="delete"
                iconColor="#dc3545"
                onPress={handleDelete}
              />
            </View>
          )}
        />
        <Card.Content>
          <TouchableRipple
            onPress={() => router.push(`/customer/${trade.ownerId}`)}
          >
            <List.Item
              title="Müşteri"
              description={trade.ownerName}
              left={(props) => <List.Icon {...props} icon="account" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
            />
          </TouchableRipple>

          <Divider style={styles.divider} />

          <List.Section>
            <List.Item
              title="Fiyat"
              description={formatPrice(trade.propertyDetails.price)}
              left={(props) => <List.Icon {...props} icon="currency-try" />}
            />
            <List.Item
              title="Alan"
              description={`${trade.propertyDetails.area}m²`}
              left={(props) => <List.Icon {...props} icon="ruler-square" />}
            />
            {trade.propertyDetails.roomType && (
              <List.Item
                title="Oda Tipi"
                description={trade.propertyDetails.roomType}
                left={(props) => <List.Icon {...props} icon="door" />}
              />
            )}
            <List.Item
              title="Ebeveyn Banyosu"
              description={
                trade.propertyDetails.hasParentBathroom ? 'Var' : 'Yok'
              }
              left={(props) => <List.Icon {...props} icon="shower" />}
            />
            <List.Item
              title="Amerikan Mutfak"
              description={
                trade.propertyDetails.isAmericanKitchen ? 'Var' : 'Yok'
              }
              left={(props) => <List.Icon {...props} icon="stove" />}
            />
            {trade.propertyDetails.floor !== undefined && (
              <List.Item
                title="Bulunduğu Kat"
                description={trade.propertyDetails.floor.toString()}
                left={(props) => <List.Icon {...props} icon="elevator" />}
              />
            )}
            {trade.propertyDetails.totalFloors !== undefined && (
              <List.Item
                title="Toplam Kat"
                description={trade.propertyDetails.totalFloors.toString()}
                left={(props) => (
                  <List.Icon {...props} icon="office-building" />
                )}
              />
            )}
            {trade.propertyDetails.age !== undefined && (
              <List.Item
                title="Bina Yaşı"
                description={trade.propertyDetails.age.toString()}
                left={(props) => <List.Icon {...props} icon="calendar" />}
              />
            )}
            {trade.propertyDetails.heating && (
              <List.Item
                title="Isıtma"
                description={HeatingLabels[trade.propertyDetails.heating]}
                left={(props) => <List.Icon {...props} icon="radiator" />}
              />
            )}
            {trade.propertyDetails.balcony !== undefined && (
              <List.Item
                title="Balkon"
                description={trade.propertyDetails.balcony ? 'Var' : 'Yok'}
                left={(props) => <List.Icon {...props} icon="balcony" />}
              />
            )}
            {trade.propertyDetails.furnished !== undefined && (
              <List.Item
                title="Eşyalı"
                description={trade.propertyDetails.furnished ? 'Evet' : 'Hayır'}
                left={(props) => <List.Icon {...props} icon="sofa" />}
              />
            )}
            {trade.propertyDetails.dues !== undefined && (
              <List.Item
                title="Aidat"
                description={formatPrice(trade.propertyDetails.dues)}
                left={(props) => <List.Icon {...props} icon="cash" />}
              />
            )}
            {trade.propertyDetails.isEligibleForCredit !== undefined && (
              <List.Item
                title="Krediye Uygun"
                description={
                  trade.propertyDetails.isEligibleForCredit ? 'Evet' : 'Hayır'
                }
                left={(props) => <List.Icon {...props} icon="bank" />}
              />
            )}
            {trade.propertyDetails.facade && (
              <List.Item
                title="Cephe"
                description={FacadeLabels[trade.propertyDetails.facade]}
                left={(props) => <List.Icon {...props} icon="compass" />}
              />
            )}
          </List.Section>

          <Divider style={styles.divider} />

          <List.Item
            title="Adres"
            description={trade.propertyDetails.location.address}
            left={(props) => <List.Icon {...props} icon="map-marker" />}
            descriptionNumberOfLines={0}
          />
          {trade.propertyDetails.location.district && (
            <List.Item
              title="İlçe"
              description={trade.propertyDetails.location.district}
              left={(props) => <List.Icon {...props} icon="map" />}
            />
          )}
          {trade.propertyDetails.location.neighborhood && (
            <List.Item
              title="Mahalle"
              description={trade.propertyDetails.location.neighborhood}
              left={(props) => <List.Icon {...props} icon="home-group" />}
            />
          )}
        </Card.Content>
      </Card>

      {trade.propertyDetails.description && (
        <Card style={styles.card}>
          <Card.Title
            title="Açıklama"
            left={(props) => <List.Icon {...props} icon="text" />}
          />
          <Card.Content>
            <Text style={styles.description}>
              {trade.propertyDetails.description}
            </Text>
          </Card.Content>
        </Card>
      )}

      {trade.propertyDetails.features &&
        trade.propertyDetails.features.length > 0 && (
          <Card style={styles.card}>
            <Card.Title
              title="Özellikler"
              left={(props) => (
                <List.Icon {...props} icon="format-list-bulleted" />
              )}
            />
            <Card.Content style={styles.features}>
              {trade.propertyDetails.features.map((feature, index) => (
                <List.Item
                  key={index}
                  title={feature}
                  left={(props) => <List.Icon {...props} icon="check-circle" />}
                />
              ))}
            </Card.Content>
          </Card>
        )}

      <Card style={styles.card}>
        <Card.Title
          title="İşlem Geçmişi"
          left={(props) => <List.Icon {...props} icon="history" />}
        />
        <Card.Content>
          {trade.history.map((item, index) => (
            <List.Item
              key={index}
              title={item.action}
              description={item.notes}
              descriptionNumberOfLines={0}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
          ))}
        </Card.Content>
      </Card>

      {trade.sales && trade.sales.length > 0 && (
        <Card style={styles.card}>
          <Card.Title
            title="Satış Geçmişi"
            left={(props) => <List.Icon {...props} icon="cash-multiple" />}
          />
          <Card.Content>
            {trade.sales.map((sale, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider style={styles.divider} />}
                <List.Item
                  title={`Satış Fiyatı: ${formatPrice(sale.price)}`}
                  description={`Tarih: ${new Date(sale.date).toLocaleDateString(
                    'tr-TR'
                  )}`}
                  left={(props) => <List.Icon {...props} icon="currency-try" />}
                />
                <TouchableRipple
                  onPress={() => router.push(`/customer/${sale.buyerId}`)}
                >
                  <List.Item
                    title="Alıcı"
                    description={sale.buyerName}
                    left={(props) => <List.Icon {...props} icon="account" />}
                    right={(props) => (
                      <List.Icon {...props} icon="chevron-right" />
                    )}
                  />
                </TouchableRipple>
                <TouchableRipple
                  onPress={() => router.push(`/customer/${sale.sellerId}`)}
                >
                  <List.Item
                    title="Satıcı"
                    description={sale.sellerName}
                    left={(props) => <List.Icon {...props} icon="account" />}
                    right={(props) => (
                      <List.Icon {...props} icon="chevron-right" />
                    )}
                  />
                </TouchableRipple>
                <List.Item
                  title={`Komisyon: ${formatPrice(sale.commission)}`}
                  description={`Oran: %${sale.commissionRate}`}
                  left={(props) => <List.Icon {...props} icon="percent" />}
                />
                {sale.notes && (
                  <List.Item
                    title="Notlar"
                    description={sale.notes}
                    left={(props) => <List.Icon {...props} icon="note-text" />}
                    descriptionNumberOfLines={0}
                  />
                )}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  divider: {
    marginVertical: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  features: {
    marginTop: -8,
  },
});
