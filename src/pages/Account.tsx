import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, Order, Profile, AccountEntry } from '../lib/supabase';
import { Invoice } from '../components/Invoice';

const statusLabels: Record<string, string> = {
  pending: 'ממתינה לאישור',
  needs_info: 'יש לעדכן כתובת וטלפון להמשך',
  confirmed: 'אושרה',
  ready: 'מוכנה לאיסוף',
  completed: 'הושלמה',
  cancelled: 'בוטלה',
};

export const Account: React.FC = () => {
  const { session, profile, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [entries, setEntries] = useState<AccountEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!session) return;
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
    const { data: ent } = await supabase.from('account_entries').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
    setEntries((ent as AccountEntry[]) || []);
    setLoading(false);
  };

  const balance = entries.reduce((sum, e) => sum + e.amount, 0);

  useEffect(() => { load(); }, [session]);
  useEffect(() => { if (profile) setForm({ full_name: profile.full_name || '', phone: profile.phone || '', address: profile.address || '' }); }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setSaving(true);
    await supabase.from('profiles').update({ full_name: form.full_name, phone: form.phone, address: form.address || null }).eq('id', session.user.id);
    await refreshProfile();
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-extrabold text-4xl text-amber-950 mb-8 animate-fade-in-up">החשבון שלי</h1>

      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-10 animate-fade-in-up">
        {!editing ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-amber-950">{profile?.full_name || '—'}</p>
              <p className="text-sm text-stone-500" dir="ltr">{profile?.phone || '—'} · {session?.user.email}</p>
              {profile?.address && <p className="text-sm text-stone-500 mt-0.5">{profile.address}</p>}
            </div>
            <button onClick={() => setEditing(true)} className="text-sm font-bold text-amber-800 hover:underline">עריכת פרטים</button>
          </div>
        ) : (
          <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">שם מלא</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">טלפון</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr"
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-bold text-amber-950 mb-1.5">כתובת <span className="font-normal text-stone-400">(לא חובה)</span></label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button disabled={saving} className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-6 py-2 rounded-full transition-colors">{saving ? 'שומר...' : 'שמירה'}</button>
              <button type="button" onClick={() => setEditing(false)} className="text-stone-500 font-bold px-6 py-2">ביטול</button>
            </div>
          </form>
        )}
      </div>

      {entries.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-10 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-xl text-amber-950">חשבון תשלומים</h2>
            <p className={`font-extrabold text-xl ${balance < 0 ? 'text-red-600' : 'text-green-700'}`}>
              {balance < 0 ? `חוב: ₪${Math.abs(balance).toFixed(2)}` : `יתרה: ₪${balance.toFixed(2)}`}
            </p>
          </div>
          <ul className="text-sm divide-y divide-amber-50">
            {entries.map(e => (
              <li key={e.id} className="py-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-stone-600">{e.note || (e.amount >= 0 ? 'זיכוי' : 'חיוב')}</p>
                  <p className="text-xs text-stone-400">{new Date(e.created_at).toLocaleString('he-IL')}</p>
                </div>
                <span className={`font-bold whitespace-nowrap ${e.amount < 0 ? 'text-red-600' : 'text-green-700'}`}>{e.amount >= 0 ? '+' : ''}₪{e.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="font-bold text-xl text-amber-950 mb-4">ההזמנות שלי</h2>
      {loading ? (
        <p className="text-stone-400">טוען...</p>
      ) : orders.length === 0 ? (
        <p className="text-stone-400">עדיין אין הזמנות. עברו לתפריט והתחילו להזמין!</p>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 animate-fade-in-up">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <p className="font-bold text-amber-950">הזמנה #{o.invoice_number || o.id.slice(0, 8)}</p>
                  <p className="text-xs text-stone-400">{new Date(o.created_at).toLocaleDateString('he-IL')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full">{statusLabels[o.status] || o.status}</span>
                  <button onClick={() => setInvoiceOrder(o)} className="text-sm font-bold text-amber-800 hover:underline">חשבונית</button>
                </div>
              </div>
              <ul className="text-sm text-stone-500 space-y-1 mb-3">
                {o.order_items?.map(it => (
                  <li key={it.id}>{it.product_name} × {it.quantity} — ₪{(it.unit_price * it.quantity).toFixed(2)}</li>
                ))}
              </ul>
              <p className="font-bold text-amber-800">סה״כ: ₪{o.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {invoiceOrder && <Invoice order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
};
