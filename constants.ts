
import { User, ContractTypeDefinition } from './types';

// Empty contracts array for a fresh system
export const INITIAL_CONTRACTS: any[] = [];

// Default Contract Types - Empty as requested, to be added via Settings
export const DEFAULT_CONTRACT_TYPES: ContractTypeDefinition[] = [];

// Initial user to allow login on first run
export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'ناجي احمد امجاور',
    phone: '0911426106',
    password: '01234',
    role: 'مدير النظام',
    status: 'نشط'
  }
];
