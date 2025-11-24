import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Transaction, AppSettings } from '../types';

// Mock Data for initial load
const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: '拿铁咖啡', price: 22, cost: 6, category: '饮品' },
  { id: '2', name: '美式咖啡', price: 18, cost: 4, category: '饮品' },
  { id: '3', name: '焦糖玛奇朵', price: 25, cost: 7, category: '饮品' },
  { id: '4', name: '手冲耶加雪菲', price: 32, cost: 12, category: '饮品' },
  { id: '5', name: '原味可颂', price: 12, cost: 5, category: '烘焙' },
  { id: '6', name: '巴斯克芝士', price: 28, cost: 10, category: '甜点' },
  { id: '7', name: '伯爵红茶', price: 15, cost: 3, category: '饮品' },
  { id: '8', name: '提拉米苏', price: 32, cost: 12, category: '甜点' },
];

let supabase: SupabaseClient | null = null;

export const initSupabase = (settings: AppSettings) => {
  if (settings.useCloud && settings.supabaseUrl && settings.supabaseKey) {
    try {
      supabase = createClient(settings.supabaseUrl, settings.supabaseKey);
      return true;
    } catch (e) {
      console.error("Supabase init failed", e);
      return false;
    }
  }
  supabase = null;
  return false;
};

// --- Products ---

export const getProducts = async (settings: AppSettings): Promise<Product[]> => {
  if (settings.useCloud && supabase) {
    const { data, error } = await supabase.from('products').select('*');
    if (!error && data) return data as Product[];
    console.error("Cloud fetch error, falling back to local", error);
  }
  
  const local = localStorage.getItem('products');
  return local ? JSON.parse(local) : INITIAL_PRODUCTS;
};

export const saveProduct = async (settings: AppSettings, product: Product) => {
  if (settings.useCloud && supabase) {
    await supabase.from('products').upsert(product);
  }
  // Always sync to local for offline backup/speed
  const current = await getProducts({ ...settings, useCloud: false }); // force get local
  const updated = [...current.filter(p => p.id !== product.id), product];
  localStorage.setItem('products', JSON.stringify(updated));
};

export const deleteProduct = async (settings: AppSettings, id: string) => {
  if (settings.useCloud && supabase) {
    await supabase.from('products').delete().eq('id', id);
  }
  const current = await getProducts({ ...settings, useCloud: false });
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem('products', JSON.stringify(updated));
};

// --- Transactions ---

export const getTransactions = async (settings: AppSettings): Promise<Transaction[]> => {
  if (settings.useCloud && supabase) {
    const { data, error } = await supabase.from('transactions').select('*').order('timestamp', { ascending: false });
    if (!error && data) return data as Transaction[];
    console.error("Cloud fetch error", error);
  }

  const local = localStorage.getItem('transactions');
  return local ? JSON.parse(local) : [];
};

export const saveTransaction = async (settings: AppSettings, transaction: Transaction) => {
  if (settings.useCloud && supabase) {
    await supabase.from('transactions').insert(transaction);
  }
  const current = await getTransactions({ ...settings, useCloud: false });
  const updated = [transaction, ...current];
  localStorage.setItem('transactions', JSON.stringify(updated));
};

// --- Settings ---
export const getSettings = (): AppSettings => {
  const s = localStorage.getItem('appSettings');
  return s ? JSON.parse(s) : { useCloud: false, supabaseUrl: '', supabaseKey: '' };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem('appSettings', JSON.stringify(settings));
};