export type CommunicationType = 'call' | 'message' | 'meeting';

export const CommunicationTypeLabels: Record<CommunicationType, string> = {
  call: 'Telefon',
  message: 'Mesaj',
  meeting: 'Görüşme',
};

export interface Communication {
  id: string;
  customerId: string;
  customerName: string;
  type: CommunicationType;
  date: string; // ISO string
  notes: string;
  reminder?: {
    date: string; // ISO string
    notes: string;
    completed: boolean;
    notificationId?: string; // ID for scheduled notification
  };
  createdAt: string;
  updatedAt: string;
}

export type CommunicationFormData = Omit<
  Communication,
  'id' | 'createdAt' | 'updatedAt'
>;
