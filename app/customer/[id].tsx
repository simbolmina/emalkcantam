import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import {
  Text,
  Button,
  List,
  Divider,
  ActivityIndicator,
  Card,
  IconButton,
  TouchableRipple,
  Chip,
} from 'react-native-paper';
import { Customer } from '../../src/models/Customer';
import { Trade } from '../../src/models/Trade';
import {
  Communication,
  CommunicationTypeLabels,
} from '../../src/models/Communication';
import { customerStorage } from '../../src/services/customerStorage';
import { tradeStorage } from '../../src/services/tradeStorage';
import { communicationStorage } from '../../src/services/communicationStorage';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  formatPhoneNumber,
  formatPhoneForDisplay,
} from '../../src/utils/phoneUtils';

const CustomerTypeLabels = {
  buyer: 'Alıcı',
  seller: 'Satıcı',
  both: 'Alıcı/Satıcı',
};

const PropertyTypeLabels: Record<string, string> = {
  house: 'Müstakil',
  apartment: 'Daire',
  land: 'Arsa',
  commercial: 'İş Yeri',
  other: 'Diğer',
};

const CommunicationTypeIcons = {
  call: 'phone',
  message: 'message',
  meeting: 'account-multiple',
};

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomerAndData();
  }, [id]);

  const loadCustomerAndData = async () => {
    try {
      const [customerData, allTrades, customerCommunications] =
        await Promise.all([
          customerStorage.getById(id as string),
          tradeStorage.getAll(),
          communicationStorage.getByCustomerId(id as string),
        ]);

      console.log('Customer ID:', id);
      console.log('Fetched communications:', customerCommunications);

      setCustomer(customerData);

      // Filter trades for this customer (either as owner or in sales history)
      const customerTrades = allTrades.filter(
        (trade) =>
          trade.ownerId === id ||
          trade.sales?.some(
            (sale) => sale.buyerId === id || sale.sellerId === id
          )
      );
      setTrades(customerTrades);

      // Sort communications by date, newest first
      const sortedCommunications = customerCommunications.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      console.log('Sorted communications:', sortedCommunications);
      setCommunications(sortedCommunications);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await customerStorage.delete(id as string);
      router.back();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const handleCall = (phoneNumber: string) => {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      Linking.openURL(`tel:${formattedNumber}`);
    } catch (error) {
      Alert.alert('Hata', 'Geçersiz telefon numarası');
    }
  };

  const handleMessage = (phoneNumber: string) => {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      Linking.openURL(`sms:${formattedNumber}`);
    } catch (error) {
      Alert.alert('Hata', 'Geçersiz telefon numarası');
    }
  };

  const handleWhatsApp = (phoneNumber: string) => {
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      Linking.openURL(`whatsapp://send?phone=${formattedNumber}`);
    } catch (error) {
      Alert.alert('Hata', 'Geçersiz telefon numarası');
    }
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: tr });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.container}>
        <Text>Müşteri bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={`${customer.firstName} ${customer.lastName}`}
          subtitle={CustomerTypeLabels[customer.customerType]}
          right={(props) => (
            <View style={styles.headerButtons}>
              <IconButton
                {...props}
                icon="pencil"
                onPress={() => router.push(`/customer/edit/${id}`)}
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
          <List.Section>
            <TouchableRipple
              onPress={() => handleCall(customer.contactInfo.phone)}
            >
              <List.Item
                title="Telefon"
                description={formatPhoneForDisplay(customer.contactInfo.phone)}
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon="phone"
                    style={styles.contactIcon}
                  />
                )}
                right={(props) => <List.Icon {...props} icon="phone-dial" />}
                style={styles.contactItem}
              />
            </TouchableRipple>

            {customer.contactInfo.alternativePhone && (
              <TouchableRipple
                onPress={() =>
                  handleCall(customer.contactInfo.alternativePhone!)
                }
              >
                <List.Item
                  title="Alternatif Telefon"
                  description={formatPhoneForDisplay(
                    customer.contactInfo.alternativePhone!
                  )}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="phone-plus"
                      style={styles.contactIcon}
                    />
                  )}
                  right={(props) => <List.Icon {...props} icon="phone-dial" />}
                  style={styles.contactItem}
                />
              </TouchableRipple>
            )}

            {customer.contactInfo.email && (
              <TouchableRipple
                onPress={() => handleEmail(customer.contactInfo.email!)}
              >
                <List.Item
                  title="E-posta"
                  description={customer.contactInfo.email}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon="email"
                      style={styles.contactIcon}
                    />
                  )}
                  right={(props) => <List.Icon {...props} icon="email-send" />}
                  style={styles.contactItem}
                />
              </TouchableRipple>
            )}

            {customer.contactInfo.address && (
              <List.Item
                title="Adres"
                description={customer.contactInfo.address}
                left={(props) => <List.Icon {...props} icon="map-marker" />}
              />
            )}

            <Divider style={styles.divider} />

            {customer.hometown && (
              <List.Item
                title="Memleket"
                description={customer.hometown}
                left={(props) => <List.Icon {...props} icon="home-city" />}
              />
            )}

            {customer.occupation && (
              <List.Item
                title="Meslek"
                description={customer.occupation}
                left={(props) => <List.Icon {...props} icon="briefcase" />}
              />
            )}

            {customer.referredBy && (
              <List.Item
                title="Referans"
                description={customer.referredBy}
                left={(props) => (
                  <List.Icon {...props} icon="account-arrow-left" />
                )}
              />
            )}

            <Divider style={styles.divider} />

            <List.Item
              title="Ticari Potansiyel"
              description={`${customer.commercialPotential}/5`}
              left={(props) => <List.Icon {...props} icon="star" />}
            />

            <Divider style={styles.divider} />

            <List.Item
              title="Oluşturulma Tarihi"
              description={new Date(customer.createdAt).toLocaleDateString(
                'tr-TR'
              )}
              left={(props) => <List.Icon {...props} icon="calendar" />}
            />
            <List.Item
              title="Son Güncelleme"
              description={new Date(customer.updatedAt).toLocaleDateString(
                'tr-TR'
              )}
              left={(props) => <List.Icon {...props} icon="calendar-clock" />}
            />
          </List.Section>
        </Card.Content>
      </Card>

      <Card style={[styles.card, styles.notesCard]}>
        <Card.Title
          title="Müşteri Notları"
          left={(props) => <List.Icon {...props} icon="note-text" />}
        />
        <Card.Content>
          <Text style={styles.notes}>{customer.notes || 'Not eklenmemiş'}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="İletişim Geçmişi"
          subtitle={`${communications.length} kayıt`}
          left={(props) => <List.Icon {...props} icon="history" />}
          right={(props) => (
            <IconButton
              {...props}
              icon="plus"
              onPress={() => router.push('/communication/new')}
            />
          )}
        />
        <Card.Content>
          {communications.length === 0 ? (
            <Text style={styles.emptyText}>Henüz iletişim kaydı yok</Text>
          ) : (
            <List.Section>
              {communications.map((comm) => (
                <TouchableRipple
                  key={comm.id}
                  onPress={() => router.push(`/communication/${comm.id}`)}
                >
                  <List.Item
                    title={formatDate(comm.date)}
                    titleStyle={styles.communicationTitle}
                    description={comm.notes}
                    descriptionStyle={styles.communicationDescription}
                    style={styles.contactItem}
                    left={(props) => (
                      <View style={styles.communicationIconContainer}>
                        <List.Icon
                          {...props}
                          icon={CommunicationTypeIcons[comm.type]}
                          color="#1976D2"
                        />
                        <Text style={styles.communicationType}>
                          {CommunicationTypeLabels[comm.type]}
                        </Text>
                      </View>
                    )}
                    right={(props) =>
                      comm.reminder && !comm.reminder.completed ? (
                        <View style={styles.communicationMeta}>
                          <List.Icon {...props} icon="bell" color="#ffc107" />
                        </View>
                      ) : null
                    }
                  />
                </TouchableRipple>
              ))}
            </List.Section>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title
          title="İlgili Emlaklar"
          subtitle={`${trades.length} emlak kaydı`}
          left={(props) => <List.Icon {...props} icon="home-group" />}
          right={(props) => (
            <IconButton
              {...props}
              icon="plus"
              onPress={() => router.push('/trade/new')}
            />
          )}
        />
        <Card.Content>
          {trades.length === 0 ? (
            <Text style={styles.emptyText}>Henüz emlak kaydı yok</Text>
          ) : (
            <List.Section>
              {trades.map((trade) => (
                <TouchableRipple
                  key={trade.id}
                  onPress={() => router.push(`/trade/${trade.id}`)}
                >
                  <List.Item
                    title={trade.propertyDetails.title}
                    description={`${PropertyTypeLabels[trade.propertyType]} • ${
                      trade.propertyDetails.roomType || 'N/A'
                    } • ${formatPrice(trade.propertyDetails.price)}`}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={
                          trade.propertyType === 'house'
                            ? 'home'
                            : trade.propertyType === 'apartment'
                            ? 'office-building'
                            : trade.propertyType === 'land'
                            ? 'terrain'
                            : trade.propertyType === 'commercial'
                            ? 'store'
                            : 'home-variant'
                        }
                      />
                    )}
                    right={(props) => (
                      <View style={styles.tradeStatus}>
                        <List.Icon
                          {...props}
                          icon={
                            trade.status === 'sold'
                              ? 'check-circle'
                              : trade.status === 'pending'
                              ? 'progress-clock'
                              : trade.status === 'cancelled'
                              ? 'close-circle'
                              : trade.status === 'archived'
                              ? 'archive'
                              : 'home-circle'
                          }
                          color={
                            trade.status === 'sold'
                              ? '#28a745'
                              : trade.status === 'pending'
                              ? '#007bff'
                              : trade.status === 'cancelled'
                              ? '#dc3545'
                              : trade.status === 'archived'
                              ? '#6c757d'
                              : '#ffc107'
                          }
                        />
                      </View>
                    )}
                  />
                </TouchableRipple>
              ))}
            </List.Section>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
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
  card: {
    margin: 16,
  },
  notesCard: {
    marginTop: 0,
  },
  divider: {
    marginVertical: 8,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
  },
  tradeStatus: {
    justifyContent: 'center',
  },
  communicationIconContainer: {
    width: 56,
    alignItems: 'center',
    paddingLeft: 8,
  },
  communicationType: {
    fontSize: 11,
    color: '#1976D2',
    marginTop: 2,
    textAlign: 'center',
  },
  communicationTitle: {
    fontSize: 14,
    color: '#666',
  },
  communicationDescription: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  communicationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
  },
  contactItem: {
    minHeight: 72,
  },
  contactIcon: {
    marginLeft: 8,
  },
});
