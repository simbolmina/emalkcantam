# EmlakÇantam - React Native Customer Management App

## App Overview

EmlakÇantam is a customer management app for estate agents/brokers built with React Native and Expo focusing on storing and managing customer information, communication history, and trade history, with features for daily summaries and earnings tracking. The app will be designed for local storage with export capabilities for backup.

App will be used by Turkish agents and customers so every visible text should be turkish but adding multilanguage in future is possible so keep it updatable later on.

## Project Structure

```
/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── customers.tsx
│   │   ├── communications.tsx
│   │   └── trades.tsx
│   ├── customer/
│   │   ├── _layout.tsx
│   │   ├── [id].tsx
│   │   ├── new.tsx
│   │   └── edit/
│   │       └── [id].tsx
│   ├── communication/
│   │   ├── _layout.tsx
│   │   ├── [id].tsx
│   │   ├── new.tsx
│   │   └── edit/
│   │       └── [id].tsx
│   ├── trade/
│   │   ├── _layout.tsx
│   │   ├── [id].tsx
│   │   ├── new.tsx
│   │   └── edit/
│   │       └── [id].tsx
│   └── _layout.tsx
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── CustomerSelector.tsx
│   │   ├── customer/
│   │   ├── communication/
│   │   │   └── CommunicationForm.tsx
│   │   └── trade/
│   ├── models/
│   │   ├── Customer.ts
│   │   ├── Communication.ts
│   │   └── Trade.ts
│   ├── services/
│   │   ├── customerStorage.ts
│   │   ├── communicationStorage.ts
│   │   ├── notificationService.ts
│   │   └── tradeStorage.ts
│   └── theme.ts
├── assets/
├── constants/
└── hooks/
```

## Data Models

### Customer Model

```typescript
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  customerType: 'buyer' | 'seller' | 'both';
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    alternativePhone?: string;
  };
  hometown?: string;
  occupation?: string;
  notes: string;
  commercialPotential: number; // 1-5 scale
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Form data type omits id and timestamps
type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
```

### Communication Model

```typescript
interface Communication {
  id: string;
  customerId: string;
  customerName: string;
  type: 'call' | 'message' | 'meeting';
  date: string; // ISO string
  notes: string;
  reminder?: {
    date: string; // ISO string
    notes: string;
    completed: boolean;
    notificationId?: string; // ID for scheduled local notification
  };
  createdAt: string;
  updatedAt: string;
}
```

### Trade Model

```typescript
interface PropertyLocation {
  address: string;
  district?: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
}

interface PropertyDetails {
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

interface SaleRecord {
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

interface TradeHistory {
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

interface Trade {
  id: string;
  ownerId: string; // Current owner's ID
  ownerName: string; // Current owner's name
  propertyType: 'house' | 'apartment' | 'land' | 'commercial';
  propertyDetails: PropertyDetails;
  status: 'active' | 'pending' | 'sold' | 'cancelled' | 'archived';
  history: TradeHistory[];
  sales: SaleRecord[]; // All sales records of this property
  createdAt: string;
  updatedAt: string;
}

// Form data type omits id, timestamps, and history
type TradeFormData = Omit<Trade, 'id' | 'createdAt' | 'updatedAt' | 'history'>;
```

## Features

### Customer Management

- Add/Edit/Delete customers
- View customer details with clickable contact information
- Rate commercial potential
- Search and filter customers
- Track customer type (buyer/seller/both)
- Manage customer notes
- View communication history
- View associated properties/trades

### Communication Management

- Track all communications with customers
- Support for different communication types (call, message, meeting)
- Add reminders for follow-ups with local notifications:
  - Schedule notifications for future follow-ups
  - Receive notifications even when app is closed
  - Notifications include customer name and reminder notes
  - Automatic notification management (scheduling/canceling)
  - Notifications work offline (no server required)
- View communication history by customer
- Search and filter communications
- Mark reminders as completed (automatically cancels notifications)
- Add notes to each communication
- Bottom sheet customer selector for easy customer selection
- Integrated with customer details view

### Trade Management

- Add/Edit/Delete trades (properties)
- Track complete property sales history
- Record multiple sales of the same property
- Track commission and rates for each sale
- Monitor property status changes
- Record detailed property features
- Search and filter trades by type and status
- Turkish-specific property details
- Track price changes over time

### Dashboard Features (Planned)

- Quick overview of active properties
- Recent sales summary
- Monthly earnings overview
- Upcoming reminders
- Recent communications
- Property statistics by type
- Sales performance metrics
- Commission earnings tracking
- Hot leads tracking
- Activity timeline

### UI/UX Features

- Bottom sheet modals for better mobile experience
- Consistent styling across all sections
- Clear visual hierarchy in lists and details
- Icon-based navigation
- Responsive layouts
- Touch-friendly interface
- Visual indicators for status and reminders
- Easy access to contact actions
- Intuitive property management
- Local notifications for reminders
- Permission handling for notifications

### Future Enhancements

- Cloud sync functionality
- Advanced analytics and reporting
- Document attachment capability
- Customer segmentation and tagging
- Integration with external CRM systems
- Enhanced notification features:
  - Custom notification sounds
  - Notification grouping
  - Snooze functionality
  - Quick actions from notifications
  - Multiple notification channels
- Multi-user support
- Dark mode theme
- Export/Import functionality
- Calendar integration for reminders
- Voice notes for communications
- Automated follow-up suggestions
