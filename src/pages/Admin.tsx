import React, { useEffect, useState } from 'react';
import { supabase, Product, Order, productImage, SiteSettings, siteLogo, Profile, tierLabels } from '../lib/supabase';
import { PromotionsAdmin } from '../components/PromotionsAdmin';

const emptyForm = { id: '', name: '', sku: '', description: '', price: '', wholesale_price: '', category: '', image_url: '', image_base64: '' };

const parseCsv = (text: string): Record<string, string>[] => {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cells[i] ?? ''; });
    return row;
  });
};

const statusOptions = ['pending', 'needs_info', 'confirmed', 'ready', 'completed', 'cancelled'];
const statusLabels: Record<string, string> = {
  pending: 'ממתינה לאישור', needs_info: 'יש לעדכן כתובת וטלפון להמשך', confirmed: 'אושרה', ready: 'מוכנה לאיסוף', completed: 'הושלמה', cancelled: 'בוטלה',
};

export const Admin: React.FC = () => {
  const [tab, setTab] = useState<'products' | 'promotions' | 'orders' | 'settings' | 'customers'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Profile[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts((data as Product[]) || []);
  };
  const loadOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    setOrders((data as Order[]) || []);
  };
  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    setSettings((data as SiteSettings) || null);
  };
  const loadCustomers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setCustomers((data as Profile[]) || []);
  };

  useEffect(() => { loadProducts(); loadOrders(); loadSettings(); loadCustomers(); }, []);

  const updateCustomerTier = async (c: Profile, customer_tier: Profile['customer_tier']) => {
    await supabase.from('profiles').update({ customer_tier }).eq('id', c.id);
    setCustomers(cs => cs.map(x => x.id === c.id ? { ...x, customer_tier } : x));
  };
  const updateCustomerDiscount = async (c: Profile, discount_percent: number) => {
    await supabase.from('profiles').update({ discount_percent }).eq('id', c.id);
    setCustomers(cs => cs.map(x => x.id === c.id ? { ...x, discount_percent } : x));
  };

  const handleLogoFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      setSavingLogo(true);
      await supabase.from('site_settings').upsert({ id: 1, logo_base64: reader.result as string, logo_url: null });
      await loadSettings();
      setSavingLogo(false);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => { setForm(emptyForm); setEditing(false); };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image_base64: reader.result as string, image_url: '' }));
    reader.readAsDataURL(file);
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        sku: form.sku || null,
        description: form.description || null,
        price: parseFloat(form.price) || 0,
        wholesale_price: form.wholesale_price ? parseFloat(form.wholesale_price) : null,
        category: form.category || null,
        image_url: form.image_url || null,
        image_base64: form.image_base64 || null,
      };
      if (editing && form.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
      resetForm();
      loadProducts();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (p: Product) => {
    setForm({
      id: p.id, name: p.name, sku: p.sku || '', description: p.description || '', price: String(p.price),
      wholesale_price: p.wholesale_price != null ? String(p.wholesale_price) : '',
      category: p.category || '', image_url: p.image_url || '', image_base64: p.image_base64 || '',
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (p: Product) => {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    loadProducts();
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`למחוק את "${p.name}"?`)) return;
    await supabase.from('products').delete().eq('id', p.id);
    loadProducts();
  };

  const handleCsvImport = async (file: File) => {
    setImportMsg(null);
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) { setImportMsg('הקובץ ריק או לא בפורמט תקין'); return; }
    const payload = rows.filter(r => r.name).map(r => ({
      name: r.name,
      sku: r.sku || r['מק"ט'] || r['מקט'] || null,
      description: r.description || null,
      price: parseFloat(r.price) || 0,
      category: r.category || null,
      image_url: r.image_url || null,
    }));
    if (payload.length === 0) { setImportMsg('לא נמצאו שורות עם עמודת name תקינה'); return; }
    const { error } = await supabase.from('products').insert(payload);
    if (error) setImportMsg(`שגיאה: ${error.message}`);
    else { setImportMsg(`יובאו ${payload.length} מוצרים בהצלחה`); loadProducts(); }
  };

  const updateOrderStatus = async (o: Order, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', o.id);
    if (o.user_id) {
      await supabase.from('notifications').insert({
        user_id: o.user_id,
        order_id: o.id,
        message: `סטטוס ההזמנה שלך עודכן ל"${statusLabels[status] || status}"`,
      });
    }
    loadOrders();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-extrabold text-4xl text-amber-950 mb-2 animate-fade-in-up">ניהול הקונדיטוריה</h1>
      <p className="text-stone-400 mb-8">ניהול מוצרים, תמונות והזמנות</p>

      <div className="flex bg-amber-50 rounded-full p-1 w-fit mb-10">
        <button onClick={() => setTab('products')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'products' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>מוצרים</button>
        <button onClick={() => setTab('promotions')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'promotions' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>מבצעים ופרסומים</button>
        <button onClick={() => setTab('orders')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'orders' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>הזמנות ({orders.length})</button>
        <button onClick={() => setTab('customers')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'customers' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>לקוחות</button>
        <button onClick={() => setTab('settings')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'settings' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>הגדרות אתר</button>
      </div>

      {tab === 'customers' ? (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-x-auto animate-fade-in-up">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-amber-900 bg-amber-50">
                <th className="text-right px-5 py-3 font-bold">שם</th>
                <th className="text-right px-5 py-3 font-bold">טלפון</th>
                <th className="text-right px-5 py-3 font-bold">סוג לקוח</th>
                <th className="text-right px-5 py-3 font-bold">הנחה אוטומטית (%)</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-t border-amber-50">
                  <td className="px-5 py-3 font-bold text-amber-950">{c.full_name || '—'}</td>
                  <td className="px-5 py-3 text-stone-500" dir="ltr">{c.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <select value={c.customer_tier} onChange={e => updateCustomerTier(c, e.target.value as Profile['customer_tier'])}
                      className="border border-amber-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400">
                      {Object.entries(tierLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <input type="number" min="0" max="100" value={c.discount_percent}
                      onChange={e => updateCustomerDiscount(c, Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                      className="w-20 border border-amber-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-5 py-4 text-xs text-stone-400">סוג "סיטונאי" משתמש במחיר הסיטונאי שהוגדר למוצר (אם קיים), אחרת מופעלת ההנחה האוטומטית. סוג "VIP" וגם "רגיל" משתמשים בהנחה האוטומטית בלבד.</p>
        </div>
      ) : tab === 'settings' ? (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 max-w-md animate-fade-in-up">
          <h2 className="font-bold text-lg text-amber-950 mb-4">לוגו האתר</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden">
              {siteLogo(settings) ? <img src={siteLogo(settings)} alt="לוגו" className="w-full h-full object-cover" /> : <span className="text-3xl">🍰</span>}
            </div>
            <label className="cursor-pointer bg-amber-800 hover:bg-amber-900 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
              {savingLogo ? 'שומר...' : 'העלאת לוגו חדש'}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleLogoFile(e.target.files[0])} />
            </label>
          </div>
          <p className="text-xs text-stone-400">התמונה תוצג בעיגול בראש האתר. מומלץ תמונה ריבועית.</p>
        </div>
      ) : tab === 'promotions' ? (
        <PromotionsAdmin />
      ) : tab === 'products' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={submitProduct} className="lg:col-span-1 bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4 h-fit animate-fade-in-up">
            <h2 className="font-bold text-lg text-amber-950">{editing ? 'עריכת מוצר' : 'הוספת מוצר חדש'}</h2>
            {error && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</p>}
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">שם המוצר</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">תיאור</label>
              <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">מק״ט</label>
                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} dir="ltr"
                  className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">מחיר (₪)</label>
                <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">מחיר סיטונאי (₪)</label>
                <input type="number" step="0.01" min="0" value={form.wholesale_price} onChange={e => setForm({ ...form, wholesale_price: e.target.value })}
                  placeholder="אופציונלי" className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">קטגוריה</label>
                <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">קישור לתמונה (URL)</label>
              <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value, image_base64: '' })} dir="ltr"
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">או העלאת תמונה מהמחשב</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
                className="w-full text-sm text-stone-500 file:ml-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-amber-100 file:text-amber-900 file:font-bold" />
            </div>
            {(form.image_url || form.image_base64) && (
              <img src={form.image_url || form.image_base64} alt="תצוגה מקדימה" className="w-full aspect-video object-cover rounded-xl border border-amber-100" />
            )}
            <div className="flex gap-3">
              <button disabled={saving} className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors">
                {saving ? 'שומר...' : editing ? 'עדכון מוצר' : 'הוספת מוצר'}
              </button>
              {editing && <button type="button" onClick={resetForm} className="text-stone-500 font-bold px-4">ביטול</button>}
            </div>
          </form>

          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 animate-fade-in-up">
              <h3 className="font-bold text-amber-950 mb-1.5">ייבוא רשימת מוצרים מקובץ CSV</h3>
              <p className="text-xs text-stone-400 mb-3">עמודות נתמכות: name, sku, description, price, category, image_url (שורה ראשונה = כותרות, מופרדות בפסיקים)</p>
              <input type="file" accept=".csv,text/csv" onChange={e => e.target.files?.[0] && handleCsvImport(e.target.files[0])}
                className="w-full text-sm text-stone-500 file:ml-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-amber-100 file:text-amber-900 file:font-bold" />
              {importMsg && <p className="text-sm text-amber-700 mt-2">{importMsg}</p>}
            </div>
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center gap-4 animate-fade-in-up">
                <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {productImage(p) ? <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🧁</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-amber-950 truncate">{p.name} {p.sku && <span className="text-xs font-normal text-stone-400" dir="ltr">({p.sku})</span>}</p>
                  <p className="text-sm text-amber-700">₪{p.price.toFixed(2)} {p.category && `· ${p.category}`}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{p.is_active ? 'פעיל' : 'מוסתר'}</span>
                <button onClick={() => toggleActive(p)} className="text-xs font-bold text-amber-700 hover:underline whitespace-nowrap">{p.is_active ? 'הסתר' : 'הצג'}</button>
                <button onClick={() => editProduct(p)} className="text-xs font-bold text-amber-700 hover:underline">עריכה</button>
                <button onClick={() => deleteProduct(p)} className="text-xs font-bold text-red-600 hover:underline">מחיקה</button>
              </div>
            ))}
            {products.length === 0 && <p className="text-stone-400 text-center py-10">אין עדיין מוצרים. הוסיפו את המוצר הראשון!</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 animate-fade-in-up">
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
              {o.notes && <p className="text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-2">הערה: {o.notes}</p>}
              {o.pickup_date && <p className="text-sm text-stone-500 mb-2">תאריך איסוף מבוקש: {new Date(o.pickup_date).toLocaleDateString('he-IL')}</p>}
              <p className="font-bold text-amber-800">סה״כ: ₪{o.total.toFixed(2)}</p>
            </div>
          ))}
          {orders.length === 0 && <p className="text-stone-400 text-center py-10">אין עדיין הזמנות.</p>}
        </div>
      )}
    </div>
  );
};
