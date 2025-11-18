
export enum ContractStatus {
  Draft = 'مسودة',
  Final = 'نهائي',
  Expired = 'منتهي',
  Canceled = 'ملغي',
}

export enum PartyType {
  Individual = 'فرد',
  Company = 'شركة',
}

export enum IdType {
  Passport = 'جواز سفر',
  IdCard = 'بطاقة هوية',
  License = 'رخصة',
}

export interface ContractFile {
    name: string;
    content: string; // base64
    type: string;
}

export interface ContractTypeDefinition {
    name: string;
    file: ContractFile;
}

export interface Party {
  name: string;
  type: PartyType;
  idNumber: string;
  idType: IdType;
}

export interface Contract {
  id: number;
  title: string;
  type: string; // Stores the name of the type
  party1: Party;
  party2?: Party;
  creationDate: string;
  startDate: string;
  endDate?: string;
  value: number;
  status: ContractStatus;
  editorName: string;
  keywords: string[];
  notes: string;
  file?: ContractFile;
  isArchived: boolean;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  password?: string;
  role: 'مدير النظام' | 'محرر عقود' | 'مساعد إداري';
  status: 'نشط' | 'غير نشط';
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
}

export interface SystemSettings {
    contractTypes: ContractTypeDefinition[];
}

export type Page = 'dashboard' | 'contracts' | 'reports' | 'settings';
