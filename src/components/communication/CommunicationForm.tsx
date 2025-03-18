import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
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

interface CommunicationFormProps {
  onSubmit: (values: any) => Promise<void>;
  initialData?: any;
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
  const [type, setType] = useState<CommunicationType>(
    initialData?.type || 'call'
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [date, setDate] = useState<Date>(
    initialData?.date ? new Date(initialData.date) : new Date()
  );

  // Initialize reminder-related state from initialData
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
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  const handleSubmit = () => {
    const formData = {
      customerId,
      customerName,
      type,
      notes,
      date: date.toISOString(),
      ...(hasReminder
        ? {
            reminder: {
              date: reminderDate.toISOString(),
              notes: reminderNotes,
              completed: initialData?.reminder?.completed || false,
            },
          }
        : { reminder: null }),
    };

    onSubmit(formData);
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
