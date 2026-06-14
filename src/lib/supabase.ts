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
  customer_tier: 'regular' | 'vip' | 'wholesale';
  discount_percent: number;
  is_blocked?: boolean;
}

export const tierLabels: Record<string, string> = { regular: 'רגיל', vip: 'VIP', wholesale: 'סיטונאי' };

export interface CustomerAdmin {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  customer_tier: 'regular' | 'vip' | 'wholesale';
  discount_percent: number;
  is_admin: boolean;
  is_blocked: boolean;
  created_at: string;
  order_count: number;
  total_spent: number;
  account_balance: number;
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
  wholesale_price: number | null;
  vendor_id: string | null;
  vendor?: Vendor | null;
  reviews?: Review[];
  created_at: string;
}

export function effectivePrice(p: Product, profile: Profile | null | undefined): number {
  if (!profile) return p.price;
  if (profile.customer_tier === 'wholesale' && p.wholesale_price != null) return p.wholesale_price;
  if (profile.discount_percent > 0) return +(p.price * (1 - profile.discount_percent / 100)).toFixed(2);
  return p.price;
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
  payment_method: string | null;
  vendor_id: string | null;
  vendor?: Vendor | null;
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

export interface SiteSettings {
  id: number;
  logo_url: string | null;
  logo_base64: string | null;
  favicon_url: string | null;
  favicon_base64: string | null;
  hero_badge: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_text: string | null;
  about_text: string | null;
  announce_enabled: boolean;
  announce_emoji: string | null;
  announce_title: string | null;
  announce_body: string | null;
  announce_link: string | null;
  is_open: boolean;
  closed_message: string | null;
}

export function siteLogo(s: SiteSettings | null): string {
  return (s?.logo_url || s?.logo_base64 || '');
}

export function siteFavicon(s: SiteSettings | null): string {
  return (s?.favicon_url || s?.favicon_base64 || '');
}

export interface Notification {
  id: string;
  user_id: string | null;
  order_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  kosher_info: string | null;
  supply_method: string | null;
  area: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const vendorStatusLabels: Record<string, string> = { pending: 'ממתינה לאישור', approved: 'מאושרת', rejected: 'נדחתה' };

export interface AccountEntry {
  id: string;
  user_id: string;
  amount: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Coupon {
  id: string;
  vendor_id: string | null;
  code: string;
  discount_percent: number;
  is_active: boolean;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  image_url: string | null;
  image_base64: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
}

export function categoryImage(c: Category): string {
  return c.image_url || c.image_base64 || '';
}

export interface CategoryRequest {
  id: string;
  vendor_id: string | null;
  requested_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export function averageRating(reviews: Review[] | undefined | null): number | null {
  if (!reviews || reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

// Distance in km between two lat/lon points (haversine formula)
export function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180;
  const la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Lightweight text-based "smart" matching: scores a vendor's area string against
// the customer's free-text location, prioritizing exact/substring matches over none.
export function locationMatchScore(vendorArea: string | null | undefined, customerArea: string): number {
  if (!vendorArea || !customerArea.trim()) return 0;
  const a = vendorArea.trim().toLowerCase();
  const b = customerArea.trim().toLowerCase();
  if (a === b) return 3;
  if (a.includes(b) || b.includes(a)) return 2;
  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);
  if (aWords.some(w => bWords.includes(w))) return 1;
  return 0;
}
