export interface ClientName {
  firstName: string;
  fatherName: string;
  grandFatherName: string;
  familyName: string;
}

export interface ClientContact {
  mobile: string;
  phone?: string;
  email?: string;
  fax?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface ClientAddress {
  country: string;
  city: string;
  district: string;
  street?: string;
  buildingNumber?: string;
  postalCode?: string;
  additionalNumber?: string;
  unitNumber?: string;
  fullAddress?: string;
}

export interface ClientIdentification {
  idType: 'هوية وطنية' | 'إقامة' | 'جواز سفر' | 'سجل تجاري';
  idNumber: string;
  issueDate: string;
  expiryDate: string;
  issuePlace: string;
}

export interface Transaction {
  id: string;
  transactionCode: string;
  type: string;
  status: string;
  statusColor?: string;
  createdAt: string;
  totalFees?: number;
  paidAmount?: number;
  remainingAmount?: number;
  payments: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  method: string;
  reference?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  date: string;
  description: string;
  category: string;
  performedBy?: { name: string };
  performedById?: string;
}

export type ClientGrade = 'أ' | 'ب' | 'ج';

export interface Client {
  id: string;
  clientCode: string;
  name: ClientName;
  contact: ClientContact;
  address: ClientAddress;
  identification: ClientIdentification;
  type: string;
  category?: string;
  nationality?: string;
  occupation?: string;
  company?: string;
  commercialRegister?: string;
  
  // التقييم
  rating?: number;
  secretRating?: number;
  grade?: ClientGrade;
  gradeScore?: number;
  completionPercentage?: number;
  
  notes?: string;
  isActive: boolean;
  
  // العلاقات
  transactions?: Transaction[];
  activityLogs?: ActivityLog[];
  
  // المحسوبة
  totalFees?: number;
  totalPaid?: number;
  totalRemaining?: number;
}

// إعدادات النظام
export interface ClientClassification {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface GradingCriteria {
  totalFeesWeight: number;
  projectTypesWeight: number;
  transactionTypesWeight: number;
  completionRateWeight: number;
  secretRatingWeight: number;
}

export interface GradeThresholds {
  gradeA: { min: number; max: number };
  gradeB: { min: number; max: number };
  gradeC: { min: number; max: number };
}