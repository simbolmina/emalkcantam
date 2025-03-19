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
} from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
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

      const formData: FormData = {
        customerId,
        customerName,
        customerPhone,
        type,
        date: date.toISOString(),
        notes,
        reminder: hasReminder
          ? {
              date: reminderDate.toISOString(),
              notes: reminderNotes,
              completed: initialData?.reminder?.completed || false,
            }
          : undefined,
      };

      // Submit form data first
      const savedCommunication = await onSubmit(formData);

      // Only try to schedule notification if form submission was successful
      if (savedCommunication && formData.reminder && formData.reminder.date) {
        try {
          const notificationId = await notificationService.scheduleNotification(
            'İletişim Hatırlatması',
            `${formData.customerName} ile iletişime geçin`,
            new Date(formData.reminder.date),
            {
              communicationId: savedCommunication.id,
              customerId: formData.customerId,
              customerPhone: formData.customerPhone,
              type: 'reminder',
            }
          );

          if (notificationId && savedCommunication.reminder) {
            savedCommunication.reminder.notificationId = notificationId;
          }
        } catch (error) {
          console.error('Error scheduling notification:', error);
          // Don't block the form submission if notification fails
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

  const handleConfirmDate = (selectedDate: Date) => {
    if (showDatePicker) {
      setDate(selectedDate);
    } else if (showReminderDatePicker) {
      setReminderDate(selectedDate);
    }
    setShowDatePicker(false);
    setShowReminderDatePicker(false);
  };

  const handleCancelDate = () => {
    setShowDatePicker(false);
    setShowReminderDatePicker(false);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerName(`${customer.firstName} ${customer.lastName}`);
    setCustomerPhone(customer.contactInfo.phone);
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
            onPress={() => setShowDatePicker(true)}
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
              onPress={() => setShowReminderDatePicker(true)}
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

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={handleCancelDate}
        date={date}
      />

      <DateTimePickerModal
        isVisible={showReminderDatePicker}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={handleCancelDate}
        date={reminderDate}
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
