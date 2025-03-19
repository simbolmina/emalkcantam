import React, { useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, FlatList } from 'react-native';
import {
  TextInput,
  HelperText,
  Button,
  Chip,
  Text,
  SegmentedButtons,
  Portal,
  Modal,
  List,
  Searchbar,
  TouchableRipple,
  Surface,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CustomerFormData } from '../../models/Customer';
import { Rating } from '../common/Rating';
import * as Contacts from 'expo-contacts';

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required('İsim gerekli'),
  lastName: Yup.string().required('Soyisim gerekli'),
  customerType: Yup.string().required('Müşteri tipi gerekli'),
  contactInfo: Yup.object().shape({
    phone: Yup.string().required('Telefon gerekli'),
    email: Yup.string().email('Geçersiz email'),
    address: Yup.string(),
  }),
  hometown: Yup.string(),
  notes: Yup.string(),
  commercialPotential: Yup.number()
    .min(1)
    .max(5)
    .required('Ticari potansiyel gerekli'),
});

interface CustomerFormProps {
  initialValues: CustomerFormData;
  onSubmit: (values: CustomerFormData) => void;
  onCancel: () => void;
}

export function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>(initialValues);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const formikRef = useRef<any>(null);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.FirstName,
            Contacts.Fields.LastName,
            Contacts.Fields.PhoneNumbers,
            Contacts.Fields.Emails,
            Contacts.Fields.Addresses,
          ],
        });

        setContacts(data);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePickContact = (
    contact: Contacts.Contact,
    setFieldValue: (field: string, value: any) => void
  ) => {
    // Update all form fields using Formik's setFieldValue
    setFieldValue('firstName', contact.firstName || '');
    setFieldValue('lastName', contact.lastName || '');
    setFieldValue('contactInfo.phone', contact.phoneNumbers?.[0]?.number || '');
    setFieldValue('contactInfo.email', contact.emails?.[0]?.email || '');
    setFieldValue('contactInfo.address', contact.addresses?.[0]?.street || '');
    setShowContactPicker(false);
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${contact.firstName || ''} ${
      contact.lastName || ''
    }`.toLowerCase();
    const hasPhone = contact.phoneNumbers && contact.phoneNumbers.length > 0;
    return hasPhone && fullName.includes(searchLower);
  });

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        innerRef={formikRef}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
        }) => (
          <ScrollView style={styles.container}>
            <View style={styles.header}>
              <Button
                mode="contained"
                onPress={() => {
                  loadContacts();
                  setShowContactPicker(true);
                }}
                icon="contacts"
                style={styles.importButton}
              >
                Rehberden Seç
              </Button>
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Kişisel Bilgiler
            </Text>

            <TextInput
              label="Ad"
              value={values.firstName}
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              mode="outlined"
              style={styles.input}
              error={touched.firstName && !!errors.firstName}
            />
            {touched.firstName && errors.firstName && (
              <HelperText type="error">{errors.firstName}</HelperText>
            )}

            <TextInput
              label="Soyad"
              value={values.lastName}
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              mode="outlined"
              style={styles.input}
              error={touched.lastName && !!errors.lastName}
            />
            {touched.lastName && errors.lastName && (
              <HelperText type="error">{errors.lastName}</HelperText>
            )}

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Müşteri Tipi
            </Text>

            <SegmentedButtons
              value={values.customerType}
              onValueChange={(value) => setFieldValue('customerType', value)}
              buttons={[
                { value: 'buyer', label: 'Alıcı' },
                { value: 'seller', label: 'Satıcı' },
                { value: 'both', label: 'Her İkisi' },
              ]}
              style={styles.segmentedButton}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              İletişim Bilgileri
            </Text>

            <TextInput
              label="Telefon"
              value={values.contactInfo.phone}
              onChangeText={handleChange('contactInfo.phone')}
              onBlur={handleBlur('contactInfo.phone')}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={touched.contactInfo?.phone && !!errors.contactInfo?.phone}
            />
            {touched.contactInfo?.phone && errors.contactInfo?.phone && (
              <HelperText type="error">{errors.contactInfo.phone}</HelperText>
            )}

            <TextInput
              label="Alternatif Telefon"
              value={values.contactInfo.alternativePhone}
              onChangeText={handleChange('contactInfo.alternativePhone')}
              onBlur={handleBlur('contactInfo.alternativePhone')}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />

            <TextInput
              label="E-posta"
              value={values.contactInfo.email}
              onChangeText={handleChange('contactInfo.email')}
              onBlur={handleBlur('contactInfo.email')}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              error={touched.contactInfo?.email && !!errors.contactInfo?.email}
            />
            {touched.contactInfo?.email && errors.contactInfo?.email && (
              <HelperText type="error">{errors.contactInfo.email}</HelperText>
            )}

            <TextInput
              label="Adres"
              value={values.contactInfo.address}
              onChangeText={handleChange('contactInfo.address')}
              onBlur={handleBlur('contactInfo.address')}
              mode="outlined"
              style={styles.input}
              multiline
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ek Bilgiler
            </Text>

            <TextInput
              label="Memleket"
              value={values.hometown}
              onChangeText={handleChange('hometown')}
              onBlur={handleBlur('hometown')}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Meslek"
              value={values.occupation}
              onChangeText={handleChange('occupation')}
              onBlur={handleBlur('occupation')}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Referans"
              value={values.referredBy}
              onChangeText={handleChange('referredBy')}
              onBlur={handleBlur('referredBy')}
              mode="outlined"
              style={styles.input}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>
              Ticari Potansiyel
            </Text>

            <SegmentedButtons
              value={values.commercialPotential.toString()}
              onValueChange={(value) =>
                setFieldValue('commercialPotential', parseInt(value))
              }
              buttons={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
              ]}
              style={styles.segmentedButton}
            />

            <TextInput
              label="Notlar"
              value={values.notes}
              onChangeText={handleChange('notes')}
              onBlur={handleBlur('notes')}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={4}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={onCancel}
                style={[styles.button, styles.cancelButton]}
              >
                İptal
              </Button>
              <Button
                mode="contained"
                onPress={() => handleSubmit()}
                style={styles.button}
              >
                Kaydet
              </Button>
            </View>
          </ScrollView>
        )}
      </Formik>

      <Portal>
        <Modal
          visible={showContactPicker}
          onDismiss={() => setShowContactPicker(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={5}>
            <View style={styles.modalHeader}>
              <Text variant="titleLarge">Kişi Seç</Text>
              <IconButton
                icon="close"
                onPress={() => setShowContactPicker(false)}
              />
            </View>
            <Searchbar
              placeholder="Kişi ara..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            {loading ? (
              <ActivityIndicator style={styles.loading} />
            ) : (
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={({ item }) => (
                  <TouchableRipple
                    onPress={() => {
                      if (formikRef.current) {
                        handlePickContact(
                          item,
                          formikRef.current.setFieldValue
                        );
                      }
                    }}
                  >
                    <List.Item
                      title={`${item.firstName || ''} ${item.lastName || ''}`}
                      description={item.phoneNumbers?.[0]?.number}
                      left={(props) => <List.Icon {...props} icon="account" />}
                    />
                  </TouchableRipple>
                )}
                style={styles.contactsList}
              />
            )}
          </Surface>
        </Modal>
      </Portal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  importButton: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#666',
  },
  modalContainer: {
    flex: 1,
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  modalContent: {
    flex: 1,
    borderRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    margin: 16,
    marginTop: 0,
  },
  contactsList: {
    flex: 1,
  },
  loading: {
    padding: 20,
  },
});
