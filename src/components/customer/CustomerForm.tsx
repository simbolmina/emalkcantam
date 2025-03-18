import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, HelperText, Button, Chip, Text } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { CustomerFormData } from '../../models/Customer';
import { Rating } from '../common/Rating';

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
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
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
          <View style={styles.customerTypeContainer}>
            <Text style={styles.sectionTitle}>Müşteri Tipi</Text>
            <View style={styles.customerTypeChips}>
              {[
                { label: 'Alıcı', value: 'buyer' },
                { label: 'Satıcı', value: 'seller' },
                { label: 'Her İkisi', value: 'both' },
              ].map(({ label, value }) => (
                <Chip
                  key={value}
                  selected={values.customerType === value}
                  onPress={() => setFieldValue('customerType', value)}
                  style={styles.customerTypeChip}
                >
                  {label}
                </Chip>
              ))}
            </View>
            {touched.customerType && errors.customerType && (
              <HelperText type="error" visible={true}>
                {errors.customerType}
              </HelperText>
            )}
          </View>

          <TextInput
            label="İsim"
            value={values.firstName}
            onChangeText={handleChange('firstName')}
            onBlur={handleBlur('firstName')}
            error={touched.firstName && !!errors.firstName}
            style={styles.input}
          />
          <HelperText
            type="error"
            visible={touched.firstName && !!errors.firstName}
          >
            {errors.firstName}
          </HelperText>

          <TextInput
            label="Soyisim"
            value={values.lastName}
            onChangeText={handleChange('lastName')}
            onBlur={handleBlur('lastName')}
            error={touched.lastName && !!errors.lastName}
            style={styles.input}
          />
          <HelperText
            type="error"
            visible={touched.lastName && !!errors.lastName}
          >
            {errors.lastName}
          </HelperText>

          <TextInput
            label="Telefon"
            value={values.contactInfo.phone}
            onChangeText={handleChange('contactInfo.phone')}
            onBlur={handleBlur('contactInfo.phone')}
            error={touched.contactInfo?.phone && !!errors.contactInfo?.phone}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <HelperText
            type="error"
            visible={touched.contactInfo?.phone && !!errors.contactInfo?.phone}
          >
            {errors.contactInfo?.phone}
          </HelperText>

          <TextInput
            label="Alternatif Telefon"
            value={values.contactInfo.alternativePhone}
            onChangeText={handleChange('contactInfo.alternativePhone')}
            onBlur={handleBlur('contactInfo.alternativePhone')}
            style={styles.input}
            keyboardType="phone-pad"
          />

          <TextInput
            label="Email"
            value={values.contactInfo.email}
            onChangeText={handleChange('contactInfo.email')}
            onBlur={handleBlur('contactInfo.email')}
            error={touched.contactInfo?.email && !!errors.contactInfo?.email}
            style={styles.input}
            keyboardType="email-address"
          />
          <HelperText
            type="error"
            visible={touched.contactInfo?.email && !!errors.contactInfo?.email}
          >
            {errors.contactInfo?.email}
          </HelperText>

          <TextInput
            label="Adres"
            value={values.contactInfo.address}
            onChangeText={handleChange('contactInfo.address')}
            onBlur={handleBlur('contactInfo.address')}
            style={styles.input}
            multiline
          />

          <TextInput
            label="Memleket"
            value={values.hometown}
            onChangeText={handleChange('hometown')}
            onBlur={handleBlur('hometown')}
            style={styles.input}
          />

          <TextInput
            label="Meslek"
            value={values.occupation}
            onChangeText={handleChange('occupation')}
            onBlur={handleBlur('occupation')}
            style={styles.input}
          />

          <TextInput
            label="Notlar"
            value={values.notes}
            onChangeText={handleChange('notes')}
            onBlur={handleBlur('notes')}
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <TextInput
            label="Referans"
            value={values.referredBy}
            onChangeText={handleChange('referredBy')}
            style={styles.input}
          />

          <View style={styles.ratingContainer}>
            <Rating
              label="Ticari Potansiyel"
              value={values.commercialPotential}
              onChange={(value) => setFieldValue('commercialPotential', value)}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button onPress={onCancel} style={styles.button}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  button: {
    minWidth: 100,
  },
  ratingContainer: {
    marginVertical: 16,
  },
  customerTypeContainer: {
    marginBottom: 16,
  },
  customerTypeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customerTypeChip: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
});
