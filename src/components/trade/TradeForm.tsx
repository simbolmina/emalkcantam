import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  Portal,
  Modal,
  Chip,
  ActivityIndicator,
  Avatar,
  TouchableRipple,
  List,
  Switch,
  Divider,
} from 'react-native-paper';
import { Customer } from '../../models/Customer';
import {
  Trade,
  RoomType,
  PropertyType,
  TradeStatus,
  TradeStatusLabels,
  SaleRecord,
} from '../../models/Trade';
import { customerStorage } from '../../services/customerStorage';
import { CustomerSelector } from '../common/CustomerSelector';

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: '1+1', label: '1+1' },
  { value: '2+1', label: '2+1' },
  { value: '3+1', label: '3+1' },
  { value: '4+1', label: '4+1' },
  { value: '5+1', label: '5+1' },
  { value: '6+1', label: '6+1' },
  { value: 'other', label: 'Diğer' },
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'house', label: 'Müstakil' },
  { value: 'apartment', label: 'Daire' },
  { value: 'land', label: 'Arsa' },
  { value: 'commercial', label: 'İşyeri' },
  //   { value: 'other', label: 'Diğer' },
];

const TRADE_STATUS = Object.entries(TradeStatusLabels).map(
  ([value, label]) => ({
    value: value as TradeStatus,
    label,
  })
);

const HEATING_TYPES = [
  { value: 'dogalgaz', label: 'Doğalgaz' },
  { value: 'merkezi', label: 'Merkezi' },
  { value: 'soba', label: 'Soba' },
  { value: 'klima', label: 'Klima' },
  { value: 'yok', label: 'Yok' },
];

const FACADE_TYPES = [
  { value: 'north', label: 'Kuzey' },
  { value: 'south', label: 'Güney' },
  { value: 'east', label: 'Doğu' },
  { value: 'west', label: 'Batı' },
  { value: 'mixed', label: 'Karma' },
];

interface TradeFormProps {
  initialData?: Partial<Trade>;
  onSubmit: (data: Trade) => void;
  isLoading?: boolean;
}

export const TradeForm: React.FC<TradeFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
}) => {
  const [title, setTitle] = useState(initialData?.propertyDetails?.title || '');
  const [description, setDescription] = useState(
    initialData?.propertyDetails?.description || ''
  );
  const [price, setPrice] = useState(
    initialData?.propertyDetails?.price?.toString() || ''
  );
  const [area, setArea] = useState(
    initialData?.propertyDetails?.area?.toString() || ''
  );
  const [roomType, setRoomType] = useState<RoomType | undefined>(
    initialData?.propertyDetails?.roomType
  );
  const [hasParentBathroom, setHasParentBathroom] = useState(
    initialData?.propertyDetails?.hasParentBathroom || false
  );
  const [isAmericanKitchen, setIsAmericanKitchen] = useState(
    initialData?.propertyDetails?.isAmericanKitchen || false
  );
  const [floor, setFloor] = useState(
    initialData?.propertyDetails?.floor?.toString() || ''
  );
  const [totalFloors, setTotalFloors] = useState(
    initialData?.propertyDetails?.totalFloors?.toString() || ''
  );
  const [age, setAge] = useState(
    initialData?.propertyDetails?.age?.toString() || ''
  );
  const [heating, setHeating] = useState<Trade['propertyDetails']['heating']>(
    initialData?.propertyDetails?.heating || 'dogalgaz'
  );
  const [balcony, setBalcony] = useState(
    initialData?.propertyDetails?.balcony || false
  );
  const [furnished, setFurnished] = useState(
    initialData?.propertyDetails?.furnished || false
  );
  const [address, setAddress] = useState(
    initialData?.propertyDetails?.location?.address || ''
  );
  const [district, setDistrict] = useState(
    initialData?.propertyDetails?.location?.district || ''
  );
  const [neighborhood, setNeighborhood] = useState(
    initialData?.propertyDetails?.location?.neighborhood || ''
  );
  const [dues, setDues] = useState(
    initialData?.propertyDetails?.dues?.toString() || ''
  );
  const [isEligibleForCredit, setIsEligibleForCredit] = useState(
    initialData?.propertyDetails?.isEligibleForCredit || false
  );
  const [facade, setFacade] = useState<Trade['propertyDetails']['facade']>(
    initialData?.propertyDetails?.facade || 'mixed'
  );
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initialData?.propertyType || 'apartment'
  );
  const [status, setStatus] = useState<TradeStatus>(
    initialData?.status || 'active'
  );

  const [showCustomerSelector, setShowCustomerSelector] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const [showSaleModal, setShowSaleModal] = useState(false);
  const [showBuyerSelector, setShowBuyerSelector] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Customer | null>(null);
  const [salePrice, setSalePrice] = useState('');
  const [commission, setCommission] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [saleNotes, setSaleNotes] = useState('');

  const loadCustomer = async (ownerId: string) => {
    try {
      const customer = await customerStorage.getById(ownerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  useEffect(() => {
    if (initialData?.ownerId) {
      loadCustomer(initialData.ownerId);
    }
  }, [initialData?.ownerId]);

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStatus('active');
  };

  const handleBuyerSelect = (customer: Customer) => {
    setSelectedBuyer(customer);
  };

  const handleSaleSubmit = () => {
    if (!selectedBuyer || !selectedCustomer) return;

    const saleRecord: SaleRecord = {
      date: new Date().toISOString(),
      price: parseFloat(salePrice),
      buyerId: selectedBuyer.id,
      buyerName: `${selectedBuyer.firstName} ${selectedBuyer.lastName}`,
      sellerId: selectedCustomer.id,
      sellerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      commission: parseFloat(commission) || 0,
      commissionRate: parseFloat(commissionRate) || 0,
      notes: saleNotes,
    };

    const tradeData: Trade = {
      id: initialData?.id || '',
      ownerId: selectedBuyer.id,
      ownerName: `${selectedBuyer.firstName} ${selectedBuyer.lastName}`,
      propertyType,
      propertyDetails: {
        title,
        description,
        price: parseFloat(price) || 0,
        area: parseFloat(area) || 0,
        roomType,
        hasParentBathroom,
        isAmericanKitchen,
        floor: parseInt(floor) || undefined,
        totalFloors: parseInt(totalFloors) || undefined,
        age: parseInt(age) || undefined,
        heating,
        balcony,
        furnished,
        location: {
          address,
          district,
          neighborhood,
        },
        dues: parseFloat(dues) || undefined,
        isEligibleForCredit,
        facade,
      },
      status: 'sold',
      history: [
        ...(initialData?.history || []),
        {
          date: new Date().toISOString(),
          action: 'sold',
          notes: 'Mülk satıldı',
          sale: saleRecord,
        },
      ],
      sales: [...(initialData?.sales || []), saleRecord],
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(tradeData);
    setShowSaleModal(false);
  };

  const handleSubmit = () => {
    if (!selectedCustomer) {
      // Show error message to user
      return;
    }

    const tradeData: Trade = {
      id: initialData?.id || '',
      ownerId: selectedCustomer.id,
      ownerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
      propertyType,
      propertyDetails: {
        title,
        description,
        price: parseFloat(price) || 0,
        area: parseFloat(area) || 0,
        roomType,
        hasParentBathroom,
        isAmericanKitchen,
        floor: parseInt(floor) || undefined,
        totalFloors: parseInt(totalFloors) || undefined,
        age: parseInt(age) || undefined,
        heating,
        balcony,
        furnished,
        location: {
          address,
          district,
          neighborhood,
        },
        dues: parseFloat(dues) || undefined,
        isEligibleForCredit,
        facade,
      },
      status: status || 'active',
      history: initialData?.history || [
        {
          date: new Date().toISOString(),
          action: 'created',
          notes: 'İlan oluşturuldu',
        },
      ],
      sales: initialData?.sales || [],
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(tradeData);
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        mode="outlined"
        onPress={() => setShowCustomerSelector(true)}
        style={styles.customerButton}
        icon="account"
      >
        {selectedCustomer
          ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
          : 'Müşteri Seç'}
      </Button>

      <TextInput
        label="Başlık"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />

      <TextInput
        label="Açıklama"
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />

      <SegmentedButtons
        value={propertyType}
        onValueChange={(value) => setPropertyType(value as PropertyType)}
        buttons={PROPERTY_TYPES}
        style={styles.segmentedButton}
      />

      <TextInput
        label="Fiyat (TL)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={styles.input}
      />

      <TextInput
        label="Alan (m²)"
        value={area}
        onChangeText={setArea}
        keyboardType="numeric"
        style={styles.input}
      />

      {(propertyType === 'house' || propertyType === 'apartment') && (
        <>
          <Text style={styles.sectionTitle}>Oda Bilgileri</Text>

          <SegmentedButtons
            value={roomType || '3+1'}
            onValueChange={(value) => setRoomType(value as RoomType)}
            buttons={ROOM_TYPES}
            style={styles.segmentedButton}
          />

          <View style={styles.switchContainer}>
            <Text>Ebeveyn Banyosu</Text>
            <Switch
              value={hasParentBathroom}
              onValueChange={setHasParentBathroom}
            />
          </View>

          <View style={styles.switchContainer}>
            <Text>Amerikan Mutfak</Text>
            <Switch
              value={isAmericanKitchen}
              onValueChange={setIsAmericanKitchen}
            />
          </View>

          <TextInput
            label="Bulunduğu Kat"
            value={floor}
            onChangeText={setFloor}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Toplam Kat"
            value={totalFloors}
            onChangeText={setTotalFloors}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Bina Yaşı"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.sectionTitle}>Isınma</Text>
          <SegmentedButtons
            value={heating || 'dogalgaz'}
            onValueChange={(value) =>
              setHeating(value as Trade['propertyDetails']['heating'])
            }
            buttons={HEATING_TYPES}
            style={styles.segmentedButton}
          />

          <Text style={styles.sectionTitle}>Cephe</Text>
          <SegmentedButtons
            value={facade || 'mixed'}
            onValueChange={(value) =>
              setFacade(value as Trade['propertyDetails']['facade'])
            }
            buttons={FACADE_TYPES}
            style={styles.segmentedButton}
          />

          <View style={styles.switchContainer}>
            <Text>Balkon</Text>
            <Switch value={balcony} onValueChange={setBalcony} />
          </View>

          <View style={styles.switchContainer}>
            <Text>Eşyalı</Text>
            <Switch value={furnished} onValueChange={setFurnished} />
          </View>

          <TextInput
            label="Aidat (TL)"
            value={dues}
            onChangeText={setDues}
            keyboardType="numeric"
            style={styles.input}
          />

          <View style={styles.switchContainer}>
            <Text>Krediye Uygun</Text>
            <Switch
              value={isEligibleForCredit}
              onValueChange={setIsEligibleForCredit}
            />
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>Konum Bilgileri</Text>
      <TextInput
        label="Adres"
        value={address}
        onChangeText={setAddress}
        multiline
        style={styles.input}
      />

      <TextInput
        label="İlçe"
        value={district}
        onChangeText={setDistrict}
        style={styles.input}
      />

      <TextInput
        label="Mahalle"
        value={neighborhood}
        onChangeText={setNeighborhood}
        style={styles.input}
      />

      <Text style={styles.sectionTitle}>Durum</Text>
      <SegmentedButtons
        value={status}
        onValueChange={(value) => setStatus(value as TradeStatus)}
        buttons={TRADE_STATUS}
        style={styles.segmentedButton}
      />

      {initialData?.id && status !== 'sold' && (
        <Button
          mode="contained"
          onPress={() => setShowSaleModal(true)}
          style={styles.saleButton}
          icon="currency-usd"
        >
          Satışı Tamamla
        </Button>
      )}

      <Button
        mode="contained"
        onPress={handleSubmit}
        style={styles.submitButton}
        loading={isLoading}
      >
        Kaydet
      </Button>

      <CustomerSelector
        visible={showCustomerSelector}
        onDismiss={() => setShowCustomerSelector(false)}
        onSelect={handleCustomerSelect}
      />

      <Portal>
        <Modal
          visible={showSaleModal}
          onDismiss={() => setShowSaleModal(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Satış Detayları</Text>

          <Button
            mode="outlined"
            onPress={() => setShowBuyerSelector(true)}
            style={styles.customerButton}
            icon="account"
          >
            {selectedBuyer
              ? `${selectedBuyer.firstName} ${selectedBuyer.lastName}`
              : 'Alıcı Seç'}
          </Button>

          <TextInput
            label="Satış Fiyatı (TL)"
            value={salePrice}
            onChangeText={setSalePrice}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Komisyon (TL)"
            value={commission}
            onChangeText={setCommission}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Komisyon Oranı (%)"
            value={commissionRate}
            onChangeText={setCommissionRate}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Notlar"
            value={saleNotes}
            onChangeText={setSaleNotes}
            multiline
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSaleSubmit}
            style={styles.submitButton}
            disabled={!selectedBuyer || !salePrice}
          >
            Satışı Tamamla
          </Button>
        </Modal>
      </Portal>

      <CustomerSelector
        visible={showBuyerSelector}
        onDismiss={() => setShowBuyerSelector(false)}
        onSelect={handleBuyerSelect}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    marginBottom: 12,
  },
  customerButton: {
    marginBottom: 16,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  saleButton: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#4CAF50',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
