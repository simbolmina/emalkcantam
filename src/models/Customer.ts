import { PropertyType } from './Trade';

export type CustomerType = 'buyer' | 'seller' | 'both';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  name?: string; // Temporary field for backward compatibility during migration
  customerType: CustomerType;
  contactInfo: {
    phone: string;
    email?: string;
    address?: string;
    alternativePhone?: string;
  };
  hometown?: string;
  occupation?: string;
  notes?: string;
  commercialPotential: number; // 1-5 scale
  referredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
