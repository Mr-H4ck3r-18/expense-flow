export interface User {
  email: string;
  name: string;
  password?: string;
  createdAt?: Date;
  _id?: string;
}

export interface Expense {
  _id?: string;
  id?: string; 
  userEmail?: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  timestamp: number;
  creditCardId?: string;
  createdAt?: string | Date;
}

export interface CreditCard {
  _id?: string;
  id?: string;
  userEmail?: string;
  name: string;
  lastFourDigits: string;
  type: string; 
  color?: string;
  createdAt?: string | Date;
}

export interface ApiResponse<T = any> {
  error?: string;
  message?: string;
  [key: string]: any;
}
