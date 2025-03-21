import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  List,
  FAB,
  Searchbar,
  Chip,
  TouchableRipple,
  ActivityIndicator,
  Divider,
  Menu,
  SegmentedButtons,
  Button,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Communication,
  CommunicationTypeLabels,
} from '../../src/models/Communication';
import { communicationStorage } from '../../src/services/communicationStorage';
import { format } from 'date-fns';
import { fi, tr } from 'date-fns/locale';
import { notificationService } from '../../src/services/notificationService';
import { formatPhoneNumber } from '../../src/utils/phoneUtils';
import { useFocusEffect as useFocusEffectNavigation } from '@react-navigation/native';

const TypeIcons = {
  call: 'phone',
  message: 'message',
  meeting: 'account-multiple',
  other: 'text',
};

export default function CommunicationsScreen() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [reminders, setReminders] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('communications');
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const loadCommunications = async () => {
    try {
      const data = await communicationStorage.getAll();
      // Sort by date, most recent first
      data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setCommunications(data);
    } catch (error) {
      console.error('Error loading communications:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCommunications();
    setRefreshing(false);
  }, []);

  // Refresh data when screen is focused
  useFocusEffectNavigation(
    React.useCallback(() => {
      loadCommunications();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [commsData, remindersData] = await Promise.all([
        communicationStorage.getAll(),
        communicationStorage.getAll(),
      ]);

      // Sort communications by date, newest first
      setCommunications(
        commsData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );

      // Filter and sort reminders - show all non-completed reminders
      const activeReminders = remindersData.filter(
        (comm) => comm.reminder && !comm.reminder.completed
      );

      setReminders(
        activeReminders.sort(
          (a, b) =>
            new Date(a.reminder?.date || '').getTime() -
            new Date(b.reminder?.date || '').getTime()
        )
      );
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await communicationStorage.delete(id);
      loadData();
    } catch (error) {
      console.error('Error deleting communication:', error);
    }
  };

  const handleToggleReminder = async (communication: Communication) => {
    try {
      if (!communication.reminder) return;

      // Toggle the completed status
      const newCompleted = !communication.reminder.completed;

      // If marking as completed, cancel any pending notification
      if (newCompleted && communication.reminder.notificationId) {
        try {
          // Try cancelling using the timer ID first
          console.log(
            `Attempting to cancel timer: ${communication.reminder.notificationId}`
          );
          const timerCancelled = notificationService.cancelTimer(
            communication.reminder.notificationId
          );

          if (timerCancelled) {
            console.log(
              `Successfully cancelled timer: ${communication.reminder.notificationId}`
            );
          } else {
            console.log(
              `Timer not found, trying to cancel notification directly`
            );
            // Fall back to cancelling using Expo's API
            await notificationService.cancelNotification(
              communication.reminder.notificationId
            );
          }
        } catch (error) {
          console.error('Error cancelling notification:', error);
          // Continue despite error - we still want to mark as completed
        }
      }

      // Update the communication in storage
      console.log(`Updating reminder completed status to: ${newCompleted}`);
      await communicationStorage.update(communication.id, {
        ...communication,
        reminder: {
          ...communication.reminder,
          completed: newCompleted,
        },
      });

      // Refresh the list
      loadData();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Hata', 'Hatırlatma durumu güncellenirken bir hata oluştu.');
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

  const filteredCommunications = communications.filter((comm) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      comm.customerName.toLowerCase().includes(searchLower) ||
      comm.notes.toLowerCase().includes(searchLower)
    );
  });

  const filteredReminders = reminders.filter((comm) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      comm.customerName.toLowerCase().includes(searchLower) ||
      comm.notes.toLowerCase().includes(searchLower)
    );
  });

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

  const renderCommunicationItem = ({ item }: { item: Communication }) => (
    <Card style={styles.communicationCard}>
      <Card.Content>
        <View style={styles.communicationHeader}>
          <TouchableRipple
            onPress={() => router.push(`/customer/${item.customerId}`)}
          >
            <View style={styles.customerInfo}>
              <Text variant="titleMedium" style={styles.customerName}>
                {item.customerName}
              </Text>
              <View style={styles.typeContainer}>
                <Chip
                  icon={TypeIcons[item.type]}
                  mode="outlined"
                  style={styles.typeChip}
                  textStyle={styles.chipText}
                >
                  {CommunicationTypeLabels[item.type]}
                </Chip>
              </View>
            </View>
          </TouchableRipple>
          <Menu
            visible={menuVisible === item.id}
            onDismiss={() => setMenuVisible(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(item.id)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                router.push(`/communication/${item.id}`);
              }}
              title="Düzenle"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(null);
                handleDelete(item.id);
              }}
              title="Sil"
              leadingIcon="delete"
            />
          </Menu>
        </View>
        <Text variant="bodyMedium" style={styles.notes}>
          {item.notes}
        </Text>
        <Text variant="bodySmall" style={styles.date}>
          {formatDate(item.date)}
        </Text>
        {(activeTab === 'reminders' ||
          (item.reminder && !item.reminder.completed)) &&
          item.reminder && (
            <View style={styles.reminderContainer}>
              <View style={styles.reminderInfo}>
                <IconButton icon="bell" size={20} />
                <View>
                  <Text variant="bodyMedium" style={styles.reminderTitle}>
                    Hatırlatma
                  </Text>
                  <Text variant="bodySmall">
                    {formatDate(item.reminder.date)}
                  </Text>
                  <Text variant="bodySmall">{item.reminder.notes}</Text>
                </View>
              </View>
              <IconButton
                icon="check-circle"
                size={24}
                onPress={() => handleToggleReminder(item)}
                style={styles.completeButton}
              />
            </View>
          )}
        <View style={styles.quickActions}>
          <IconButton
            icon="phone"
            mode="contained-tonal"
            size={20}
            onPress={() => handleCall(item.customerPhone || '')}
          />
          <IconButton
            icon="message"
            mode="contained-tonal"
            size={20}
            onPress={() => handleMessage(item.customerPhone || '')}
          />
          <IconButton
            icon="whatsapp"
            mode="contained-tonal"
            size={20}
            onPress={() => handleWhatsApp(item.customerPhone || '')}
            containerColor="#25D366"
            iconColor="#fff"
          />
          <IconButton
            icon="account"
            mode="contained-tonal"
            size={20}
            onPress={() => router.push(`/customer/${item.customerId}`)}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="İletişim ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          style={styles.segmentedButtons}
          buttons={[
            {
              value: 'communications',
              label: 'İletişimler',
              icon: 'message-text',
            },
            {
              value: 'reminders',
              label: 'Hatırlatmalar',
              icon: 'bell',
            },
          ]}
        />
      </View>

      {activeTab === 'communications' ? (
        <FlatList
          data={filteredCommunications}
          keyExtractor={(item) => item.id}
          renderItem={renderCommunicationItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <FlatList
          data={filteredReminders}
          keyExtractor={(item) => item.id}
          renderItem={renderCommunicationItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  Aktif hatırlatma bulunmuyor
                </Text>
              </Card.Content>
            </Card>
          }
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/communication/new')}
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    margin: 16,
  },
  listContent: {
    padding: 16,
  },
  remindersCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  communicationCard: {
    marginBottom: 8,
  },
  communicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    gap: 8,
    paddingVertical: 4,
  },
  customerName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    lineHeight: 20,
  },
  notes: {
    marginBottom: 8,
  },
  date: {
    opacity: 0.7,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    backgroundColor: '#fff9c4',
    padding: 8,
    borderRadius: 8,
  },
  reminderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderTitle: {
    fontWeight: '600',
  },
  reminderCustomerName: {
    fontWeight: '600',
  },
  reminderActions: {
    alignItems: 'flex-end',
  },
  reminderDate: {
    opacity: 0.7,
  },
  completeButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  segmentedButtons: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  emptyCard: {
    margin: 16,
    marginTop: 32,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
