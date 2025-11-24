export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  color?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: number;
  items: CartItem[];
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'cash' | 'card' | 'qr';
}

export type ViewState = 'cashier' | 'inventory' | 'history' | 'stats' | 'settings';

export interface SalesSummary {
  totalRevenue: number;
  totalProfit: number;
  transactionCount: number;
  averageOrderValue: number;
}

export interface AppSettings {
  useCloud: boolean;
  supabaseUrl: string;
  supabaseKey: string;
}