import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  SegmentedButtons,
  Portal,
  Text,
  Switch,
  ActivityIndicator,
  Card,
  Dialog,
  TouchableRipple,
} from 'react-native-paper';
import { Customer } from '../../models/Customer';
import { customerStorage } from '../../services/customerStorage';
import {
  CommunicationType,
  CommunicationTypeLabels,
} from '../../models/Communication';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CustomerSelector } from '../common/CustomerSelector';
import { notificationService } from '../../services/notificationService';
import { Communication } from '../../models/Communication';

interface FormData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: CommunicationType;
  date: string;
  notes: string;
  reminder?: {
    date: string;
    notes: string;
    completed: boolean;
    notificationId?: string;
  };
}

interface CommunicationFormProps {
  initialData?: Partial<Communication>;
  onSubmit: (data: FormData) => Promise<Communication>;
  isLoading?: boolean;
}

interface DateTimeDialogProps {
  visible: boolean;
  onDismiss: () => void;
  currentDate: Date;
  onConfirm: (date: Date) => void;
}

const COMMUNICATION_TYPES = Object.entries(CommunicationTypeLabels).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export const CommunicationForm: React.FC<CommunicationFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [customerId, setCustomerId] = useState<string>(
    initialData?.customerId || ''
  );
  const [customerName, setCustomerName] = useState(
    initialData?.customerName || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    initialData?.customerPhone || ''
  );
  const [type, setType] = useState<CommunicationType>(
    initialData?.type || 'call'
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );

  const [hasReminder, setHasReminder] = useState(!!initialData?.reminder);
  const [reminderDate, setReminderDate] = useState<Date>(
    initialData?.reminder?.date
      ? new Date(initialData.reminder.date)
      : new Date()
  );
  const [reminderNotes, setReminderNotes] = useState(
    initialData?.reminder?.notes || ''
  );

  const [showDateDialog, setShowDateDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData?.customerId) {
      loadCustomer(initialData.customerId);
    }
  }, [initialData?.customerId]);

  const loadCustomer = async (id: string) => {
    try {
      const customer = await customerStorage.getById(id);
      if (customer) {
        setCustomerId(customer.id);
        setCustomerName(`${customer.firstName} ${customer.lastName}`);
        setCustomerPhone(customer.contactInfo.phone);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
      Alert.alert('Hata', 'Müşteri bilgileri yüklenirken bir hata oluştu.');
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      // Validate required fields
      if (!customerId || !customerName || !type || !date) {
        Alert.alert('Hata', 'Lütfen tüm zorunlu alanları doldurun.');
        return;
      }

      // Ensure dates are valid Date objects
      const communicationDate = new Date(date);
      let reminderDateObj = reminderDate;

      // Validate communication date
      if (isNaN(communicationDate.getTime())) {
        Alert.alert('Hata', 'Geçersiz iletişim tarihi.');
        return;
      }

      // Check if reminder is in the past
      const now = new Date();
      if (hasReminder && reminderDateObj <= now) {
        // Ask user if they want to pick a new time
        const userResponse = await new Promise<'cancel' | 'now' | 'pick'>(
          (resolve) => {
            Alert.alert(
              'Uyarı',
              'Hatırlatma zamanı geçmiş bir tarih için ayarlanmış.',
              [
                {
                  text: 'İptal',
                  onPress: () => resolve('cancel'),
                  style: 'cancel',
                },
                { text: 'Yeni Zaman Seç', onPress: () => resolve('pick') },
                {
                  text: '5 Dakika Sonraya Ayarla',
                  onPress: () => resolve('now'),
                },
              ]
            );
          }
        );

        if (userResponse === 'cancel') {
          setSubmitting(false);
          return;
        }

        if (userResponse === 'pick') {
          setShowReminderDialog(true);
          setSubmitting(false);
          return;
        }

        // If user wants immediate reminder, set it to 5 minutes from now
        reminderDateObj = new Date(now.getTime() + 5 * 60 * 1000);
      }

      // Ensure the reminder is at least 30 seconds in the future
      const minimumDelay = 30 * 1000; // 30 seconds
      if (
        hasReminder &&
        reminderDateObj.getTime() <= now.getTime() + minimumDelay
      ) {
        reminderDateObj = new Date(now.getTime() + 5 * 60 * 1000); // Set to 5 minutes in the future
      }

      const formData: FormData = {
        customerId,
        customerName,
        customerPhone,
        type,
        date: communicationDate.toISOString(),
        notes,
        reminder: hasReminder
          ? {
              date: reminderDateObj.toISOString(),
              notes: reminderNotes,
              completed: initialData?.reminder?.completed || false,
            }
          : undefined,
      };

      console.log(
        'Submitting form with data:',
        JSON.stringify(formData, null, 2)
      );

      // Submit form data first
      const savedCommunication = await onSubmit(formData);

      // Schedule notification if we have a valid reminder
      if (savedCommunication && formData.reminder && formData.reminder.date) {
        try {
          const reminderTime = new Date(formData.reminder.date);

          // Log notification scheduling attempt
          console.log('Attempting to schedule notification:');
          console.log('Reminder time:', reminderTime.toLocaleString());
          console.log('Current time:', new Date().toLocaleString());

          const notificationId = await notificationService.scheduleNotification(
            'İletişim Hatırlatması',
            `${formData.customerName} ile iletişime geçin`,
            reminderTime,
            {
              communicationId: savedCommunication.id,
              customerId: formData.customerId,
              customerPhone: formData.customerPhone,
              type: 'reminder',
            }
          );

          if (notificationId) {
            console.log(
              'Notification scheduled successfully with ID:',
              notificationId
            );
            if (savedCommunication.reminder) {
              savedCommunication.reminder.notificationId = notificationId;
            }
          } else {
            console.warn('Failed to schedule notification - no ID returned');
            Alert.alert(
              'Uyarı',
              'İletişim kaydedildi fakat hatırlatma bildirimi ayarlanamadı.'
            );
          }
        } catch (error) {
          console.error('Error scheduling notification:', error);
          Alert.alert(
            'Uyarı',
            'İletişim kaydedildi fakat hatırlatma bildirimi ayarlanamadı.'
          );
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Hata', 'İletişim kaydedilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd MMM yyyy HH:mm', { locale: tr });
  };

  const handleDateSelect = (selectedDate: Date) => {
    if (showDateDialog) {
      setDate(selectedDate);
      setShowDateDialog(false);
    } else if (showReminderDialog) {
      setReminderDate(selectedDate);
      setShowReminderDialog(false);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerName(`${customer.firstName} ${customer.lastName}`);
    setCustomerPhone(customer.contactInfo.phone);
  };

  const DateTimeDialog: React.FC<DateTimeDialogProps> = ({
    visible,
    onDismiss,
    currentDate,
    onConfirm,
  }) => {
    const [dialogDate, setDialogDate] = useState(currentDate);
    const [dateText, setDateText] = useState(format(currentDate, 'yyyy-MM-dd'));
    const [timeText, setTimeText] = useState(format(currentDate, 'HH:mm'));
    const [error, setError] = useState('');

    useEffect(() => {
      if (visible) {
        // Reset state when dialog opens
        setDialogDate(currentDate);
        setDateText(format(currentDate, 'yyyy-MM-dd'));
        setTimeText(format(currentDate, 'HH:mm'));
        setError('');
      }
    }, [visible, currentDate]);

    const validateAndUpdateDate = () => {
      try {
        // Parse date components
        const [year, month, day] = dateText.split('-').map(Number);
        // Parse time components
        const [hours, minutes] = timeText.split(':').map(Number);

        // Check if all components are valid numbers
        if (
          isNaN(year) ||
          isNaN(month) ||
          isNaN(day) ||
          isNaN(hours) ||
          isNaN(minutes)
        ) {
          setError('Geçersiz tarih veya saat formatı');
          return false;
        }

        // Create a new date with components
        const newDate = new Date();
        newDate.setFullYear(year);
        newDate.setMonth(month - 1); // JavaScript months are 0-indexed
        newDate.setDate(day);
        newDate.setHours(hours);
        newDate.setMinutes(minutes);
        newDate.setSeconds(0);
        newDate.setMilliseconds(0);

        // Check if date is valid
        if (isNaN(newDate.getTime())) {
          setError('Geçersiz tarih');
          return false;
        }

        // Update the dialog date and confirm
        onConfirm(newDate);
        return true;
      } catch (error) {
        console.error('Error parsing date:', error);
        setError('Tarih işlenemedi');
        return false;
      }
    };

    const handleConfirm = () => {
      validateAndUpdateDate();
    };

    return (
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Tarih ve Saat Seç</Dialog.Title>
        <Dialog.Content>
          <TextInput
            mode="outlined"
            label="Tarih"
            value={dateText}
            onChangeText={setDateText}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
          />
          <TextInput
            mode="outlined"
            label="Saat"
            value={timeText}
            onChangeText={setTimeText}
            placeholder="HH:MM"
            keyboardType="numeric"
            style={{ marginTop: 8 }}
          />
          {error ? (
            <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text>
          ) : null}
          <Text style={{ marginTop: 8, opacity: 0.7 }}>
            Örnek: 2023-01-31 ve 14:30
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>İptal</Button>
          <Button onPress={handleConfirm}>Tamam</Button>
        </Dialog.Actions>
      </Dialog>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Müşteri Bilgisi
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowCustomerSelector(true)}
            style={styles.customerButton}
            icon="account"
          >
            {customerName || 'Müşteri Seç'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title title="İletişim Detayları" />
        <Card.Content>
          <Text variant="bodyMedium" style={styles.label}>
            İletişim Tipi
          </Text>
          <SegmentedButtons
            value={type}
            onValueChange={(value) => setType(value as CommunicationType)}
            buttons={COMMUNICATION_TYPES}
            style={styles.segmentedButton}
          />

          <Text variant="bodyMedium" style={styles.label}>
            Tarih ve Saat
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowDateDialog(true)}
            style={styles.dateButton}
            icon="calendar"
          >
            {formatDate(date)}
          </Button>

          <Text variant="bodyMedium" style={styles.label}>
            Notlar
          </Text>
          <TextInput
            mode="outlined"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Title
          title="Hatırlatma"
          right={(props) => (
            <Switch
              {...props}
              value={hasReminder}
              onValueChange={setHasReminder}
            />
          )}
        />
        {hasReminder && (
          <Card.Content>
            <Text variant="bodyMedium" style={styles.label}>
              Hatırlatma Tarihi
            </Text>
            <Button
              mode="outlined"
              onPress={() => setShowReminderDialog(true)}
              style={styles.dateButton}
              icon="calendar"
            >
              {formatDate(reminderDate)}
            </Button>

            <Text variant="bodyMedium" style={styles.label}>
              Hatırlatma Notu
            </Text>
            <TextInput
              mode="outlined"
              label="Hatırlatma için not ekleyin"
              value={reminderNotes}
              onChangeText={setReminderNotes}
              style={styles.input}
            />
          </Card.Content>
        )}
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        disabled={isLoading || !customerName}
      >
        {isLoading ? <ActivityIndicator color="white" /> : 'Kaydet'}
      </Button>

      <CustomerSelector
        visible={showCustomerSelector}
        onDismiss={() => setShowCustomerSelector(false)}
        onSelect={handleCustomerSelect}
      />

      <DateTimeDialog
        visible={showDateDialog}
        onDismiss={() => setShowDateDialog(false)}
        currentDate={date}
        onConfirm={handleDateSelect}
      />

      <DateTimeDialog
        visible={showReminderDialog}
        onDismiss={() => setShowReminderDialog(false)}
        currentDate={reminderDate}
        onConfirm={handleDateSelect}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 8,
    marginTop: 16,
    opacity: 0.7,
  },
  input: {
    marginBottom: 12,
  },
  customerButton: {
    marginBottom: 8,
  },
  segmentedButton: {
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 8,
  },
  submitButton: {
    margin: 16,
    marginTop: 24,
    marginBottom: 32,
  },
});
