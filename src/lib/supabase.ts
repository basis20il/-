import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey);

export const sendContactEmail = async (payload: { type: 'contact' | 'data-deletion'; name?: string; phone?: string; email?: string; message?: string }) => {
  const res = await fetch(`${url}/functions/v1/send-contact-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('שליחת ההודעה נכשלה, נסו שוב מאוחר יותר.');
};

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  is_admin: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  image_url: string | null;
  image_base64: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  total: number;
  notes: string | null;
  pickup_date: string | null;
  invoice_number: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export function productImage(p: Product): string {
  return p.image_url || p.image_base64 || '';
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  image_base64: string | null;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function promotionImage(p: Promotion): string {
  return p.image_url || p.image_base64 || '';
}
