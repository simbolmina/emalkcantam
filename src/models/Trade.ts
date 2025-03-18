export type RoomType = '1+1' | '2+1' | '3+1' | '4+1' | '5+1' | '6+1' | 'other';
export type PropertyType = 'house' | 'apartment' | 'land' | 'commercial';
// | 'other';
export type TradeStatus =
  | 'active'
  | 'pending'
  | 'sold'
  | 'cancelled'
  | 'archived';

export interface PropertyLocation {
  address: string;
  district?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
}

export interface PropertyDetails {
  title: string;
  description: string;
  price: number;
  area: number;
  roomType?: RoomType;
  hasParentBathroom?: boolean;
  isAmericanKitchen?: boolean;
  floor?: number;
  totalFloors?: number;
  age?: number;
  heating?: 'dogalgaz' | 'merkezi' | 'soba' | 'klima' | 'yok';
  balcony?: boolean;
  furnished?: boolean;
  location: PropertyLocation;
  features?: string[];
  images?: string[];
  dues?: number;
  isEligibleForCredit?: boolean;
  facade?: 'north' | 'south' | 'east' | 'west' | 'mixed';
}

export interface SaleRecord {
  date: string;
  price: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  commission: number;
  commissionRate: number;
  notes?: string;
}

export interface TradeHistory {
  date: string;
  action:
    | 'created'
    | 'updated'
    | 'price_changed'
    | 'sold'
    | 'cancelled'
    | 'archived';
  notes: string;
  priceChange?: {
    oldPrice: number;
    newPrice: number;
  };
  sale?: SaleRecord;
}

export interface Trade {
  id: string;
  ownerId: string; // Current owner's ID
  ownerName: string; // Current owner's name
  propertyType: PropertyType;
  propertyDetails: PropertyDetails;
  status: TradeStatus;
  history: TradeHistory[];
  sales: SaleRecord[]; // All sales records of this property
  createdAt: string;
  updatedAt: string;
}

export type TradeFormData = Omit<
  Trade,
  'id' | 'createdAt' | 'updatedAt' | 'history' | 'sales'
>;

export const TradeStatusLabels: Record<TradeStatus, string> = {
  active: 'Satılık',
  pending: 'Görüşülüyor',
  sold: 'Satıldı',
  cancelled: 'İptal',
  archived: 'Arşivlendi',
};
