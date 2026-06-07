import React, { useEffect, useState } from 'react';
import { supabase, Vendor, Product, Order, vendorStatusLabels } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const statusOptions = ['pending', 'needs_info', 'confirmed', 'ready', 'completed', 'cancelled'];
const statusLabels: Record<string, string> = {
  pending: 'ממתינה לאישור', needs_info: 'יש לעדכן כתובת וטלפון להמשך', confirmed: 'אושרה', ready: 'מוכנה לאיסוף', completed: 'הושלמה', cancelled: 'בוטלה',
};

const emptyApp = { name: '', slug: '', description: '', kosher_info: '', supply_method: '', area: '' };
const emptyProduct = { id: '', name: '', sku: '', description: '', price: '', category: '', image_url: '' };

interface Commission { order_count: number; total_revenue: number; commission_rate: number; commission_amount: number; }

export const VendorDashboard: React.FC = () => {
  const { session } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null | undefined>(undefined);
  const [app, setApp] = useState(emptyApp);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commission, setCommission] = useState<Commission | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!session) return;
    const { data } = await supabase.from('vendors').select('*').eq('owner_id', session.user.id).maybeSingle();
    setVendor((data as Vendor) || null);
  };
  useEffect(() => { load(); }, [session]);

  useEffect(() => {
    if (!vendor || vendor.status !== 'approved') return;
    supabase.from('products').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false })
      .then(({ data }) => setProducts((data as Product[]) || []));
    supabase.from('orders').select('*, order_items(*)').eq('vendor_id', vendor.id).order('created_at', { ascending: false })
      .then(({ data }) => setOrders((data as Order[]) || []));
    supabase.rpc('get_vendor_commission', { p_vendor_id: vendor.id, p_month: new Date().toISOString().slice(0, 10) })
      .then(({ data }) => setCommission(data?.[0] || null));
  }, [vendor]);

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setApplying(true);
    setError(null);
    try {
      const { error: err } = await supabase.from('vendors').insert({
        owner_id: session.user.id,
        name: app.name,
        slug: app.slug.trim().toLowerCase().replace(/\s+/g, '-'),
        description: app.description || null,
        kosher_info: app.kosher_info || null,
        supply_method: app.supply_method || null,
        area: app.area || null,
      });
      if (err) throw err;
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const resetForm = () => { setForm(emptyProduct); setEditing(false); };

  const editProduct = (p: Product) => {
    setForm({ id: p.id, name: p.name, sku: p.sku || '', description: p.description || '', price: String(p.price), category: p.category || '', image_url: p.image_url || '' });
    setEditing(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        description: form.description || null,
        price: parseFloat(form.price),
        category: form.category || null,
        image_url: form.image_url || null,
        vendor_id: vendor.id,
        is_active: true,
      };
      if (editing) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', form.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('products').insert(payload);
        if (err) throw err;
      }
      resetForm();
      const { data } = await supabase.from('products').select('*').eq('vendor_id', vendor.id).order('created_at', { ascending: false });
      setProducts((data as Product[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeProduct = async (id: string) => {
    if (!confirm('למחוק את המוצר?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateOrderStatus = async (order: Order, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', order.id);
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o));
  };

  if (!session) return null;

  if (vendor === undefined) return <div className="max-w-2xl mx-auto px-6 py-24 text-center text-stone-400">טוען...</div>;

  if (!vendor) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 animate-fade-in-up">
        <h1 className="font-extrabold text-3xl text-amber-950 mb-3">הצטרפות כקונדיטוריה שותפה</h1>
        <p className="text-stone-500 mb-8">מלאו את הפרטים ובקשתכם תיבדק על ידי הנהלת האתר.</p>
        <form onSubmit={submitApplication} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">שם העסק</label>
            <input required value={app.name} onChange={e => setApp({ ...app, name: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">מזהה לכתובת (slug, באנגלית)</label>
            <input required value={app.slug} onChange={e => setApp({ ...app, slug: e.target.value })} dir="ltr"
              placeholder="my-bakery" className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">תיאור כללי</label>
            <textarea rows={3} value={app.description} onChange={e => setApp({ ...app, description: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">כשרות</label>
            <input value={app.kosher_info} onChange={e => setApp({ ...app, kosher_info: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">אופן אספקה</label>
            <input value={app.supply_method} onChange={e => setApp({ ...app, supply_method: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">איזור פעילות</label>
            <input value={app.area} onChange={e => setApp({ ...app, area: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={applying} className="w-full bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow transition-all duration-300 hover:-translate-y-0.5">
            {applying ? 'שולח...' : 'שליחת בקשה'}
          </button>
        </form>
      </div>
    );
  }

  if (vendor.status !== 'approved') {
    return (
      <div className="max-w-xl mx-auto px-6 py-28 text-center">
        <p className="text-6xl mb-4">{vendor.status === 'rejected' ? '😔' : '⏳'}</p>
        <h1 className="font-extrabold text-2xl text-amber-950 mb-2">{vendor.name}</h1>
        <p className="text-stone-500">סטטוס הבקשה: <span className="font-bold">{vendorStatusLabels[vendor.status]}</span></p>
        {vendor.status === 'pending' && <p className="text-stone-400 text-sm mt-2">נעדכן אתכם ברגע שהבקשה תיבדק.</p>}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-fade-in-up">
      <h1 className="font-extrabold text-3xl text-amber-950 mb-1">לוח בקרה — {vendor.name}</h1>
      <p className="text-stone-400 mb-10">ניהול המוצרים, ההזמנות והעמלות שלכם</p>

      {commission && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 mb-10 grid sm:grid-cols-4 gap-4 text-center">
          <div><p className="text-xs text-stone-400">הזמנות החודש</p><p className="font-extrabold text-2xl text-amber-950">{commission.order_count}</p></div>
          <div><p className="text-xs text-stone-400">מחזור החודש</p><p className="font-extrabold text-2xl text-amber-950">₪{commission.total_revenue.toFixed(2)}</p></div>
          <div><p className="text-xs text-stone-400">אחוז עמלה</p><p className="font-extrabold text-2xl text-amber-800">{(commission.commission_rate * 100).toFixed(0)}%</p></div>
          <div><p className="text-xs text-stone-400">עמלה משוערת</p><p className="font-extrabold text-2xl text-amber-800">₪{commission.commission_amount.toFixed(2)}</p></div>
          <p className="sm:col-span-4 text-xs text-stone-400 mt-1">העמלה היא 10% מכל הזמנה, ויורדת ל-5% החל מההזמנה ה-101 באותו חודש.</p>
        </div>
      )}

      <h2 className="font-bold text-xl text-amber-950 mb-4">המוצרים שלי</h2>
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <form onSubmit={saveProduct} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-3 h-fit">
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1">שם המוצר</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1">תיאור</label>
            <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1">מחיר ₪</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1">קטגוריה</label>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1">קישור לתמונה</label>
            <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} dir="ltr"
              className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button disabled={saving} className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors">
              {saving ? 'שומר...' : editing ? 'עדכון מוצר' : 'הוספת מוצר'}
            </button>
            {editing && <button type="button" onClick={resetForm} className="text-stone-500 font-bold px-4">ביטול</button>}
          </div>
        </form>

        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-amber-950">{p.name}</p>
                <p className="text-sm text-amber-700">₪{p.price.toFixed(2)} · {p.is_active ? 'פעיל' : 'מוסתר'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editProduct(p)} className="text-amber-800 font-bold hover:underline text-sm">עריכה</button>
                <button onClick={() => removeProduct(p.id)} className="text-red-500 font-bold hover:underline text-sm">מחיקה</button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p className="text-stone-400 text-center py-10">עדיין לא הוספתם מוצרים.</p>}
        </div>
      </div>

      <h2 className="font-bold text-xl text-amber-950 mb-4">הזמנות שהגיעו אליי</h2>
      <div className="space-y-4">
        {orders.map(o => (
          <div key={o.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <p className="font-bold text-amber-950">{o.customer_name} · #{o.invoice_number || o.id.slice(0, 8)}</p>
                <p className="text-xs text-stone-400" dir="ltr">{o.customer_phone} · {new Date(o.created_at).toLocaleString('he-IL')}</p>
              </div>
              <select value={o.status} onChange={e => updateOrderStatus(o, e.target.value)}
                className="text-sm font-bold border border-amber-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50 text-amber-900">
                {statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
            <ul className="text-sm text-stone-500 space-y-1 mb-2">
              {o.order_items?.map(it => <li key={it.id}>{it.product_name} × {it.quantity} — ₪{(it.unit_price * it.quantity).toFixed(2)}</li>)}
            </ul>
            <p className="font-bold text-amber-800">סה״כ: ₪{o.total.toFixed(2)} · עמלה משוערת: ₪{(o.total * (commission?.commission_rate ?? 0.1)).toFixed(2)}</p>
          </div>
        ))}
        {orders.length === 0 && <p className="text-stone-400 text-center py-10">עדיין לא התקבלו הזמנות.</p>}
      </div>
    </div>
  );
};
