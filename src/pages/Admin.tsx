import React, { useEffect, useState } from 'react';
import { supabase, Product, Order, productImage, SiteSettings, siteLogo, siteFavicon, Profile, CustomerAdmin, tierLabels, Vendor, vendorStatusLabels, CategoryRequest, AccountEntry, Coupon, Category, categoryImage } from '../lib/supabase';
import { PromotionsAdmin } from '../components/PromotionsAdmin';
import { EmojiPicker } from '../components/EmojiPicker';
import { compressImageFile, compressDataUrl } from '../lib/image';
import { useSettings } from '../context/SettingsContext';

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

const paymentLabels: Record<string, string> = {
  card: '💳 כרטיס אשראי', apple_pay: ' Apple Pay', google_pay: 'Google Pay', cash: '💵 מזומן',
};

const emptyCategoryForm = { id: '', name: '', icon: '', image_url: '', image_base64: '', sort_order: '0', is_featured: true };

export const Admin: React.FC = () => {
  const { reload: reloadSettings } = useSettings();
  const [tab, setTab] = useState<'products' | 'promotions' | 'orders' | 'settings' | 'content' | 'categories' | 'customers' | 'vendors' | 'coupons'>('products');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponPercent, setCouponPercent] = useState('10');
  const [couponExpires, setCouponExpires] = useState('');
  const [couponSaving, setCouponSaving] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeMsg, setOptimizeMsg] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categoryRequests, setCategoryRequests] = useState<CategoryRequest[]>([]);
  const [vendorStats, setVendorStats] = useState<Record<string, { order_count: number; total_revenue: number; commission_rate: number; commission_amount: number }>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerAdmin[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSort, setCustomerSort] = useState<'name' | 'created_at' | 'order_count' | 'total_spent' | 'balance'>('created_at');
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [ledgerCustomer, setLedgerCustomer] = useState<CustomerAdmin | null>(null);
  const [ledgerEntries, setLedgerEntries] = useState<AccountEntry[]>([]);
  const [ledgerAmount, setLedgerAmount] = useState('');
  const [ledgerNote, setLedgerNote] = useState('');
  const [ledgerSaving, setLedgerSaving] = useState(false);
  const [content, setContent] = useState({
    hero_badge: '', hero_title: '', hero_subtitle: '', hero_text: '', about_text: '',
    announce_enabled: false, announce_emoji: '', announce_title: '', announce_body: '', announce_link: '',
    is_open: true, closed_message: '',
  });
  const [contentSaving, setContentSaving] = useState(false);
  const [contentMsg, setContentMsg] = useState<string | null>(null);
  const [savingFavicon, setSavingFavicon] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catForm, setCatForm] = useState(emptyCategoryForm);
  const [catEditing, setCatEditing] = useState(false);
  const [catSaving, setCatSaving] = useState(false);

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
    const s = (data as SiteSettings) || null;
    setSettings(s);
    if (s) setContent({
      hero_badge: s.hero_badge || '', hero_title: s.hero_title || '', hero_subtitle: s.hero_subtitle || '',
      hero_text: s.hero_text || '', about_text: s.about_text || '',
      announce_enabled: !!s.announce_enabled, announce_emoji: s.announce_emoji || '', announce_title: s.announce_title || '',
      announce_body: s.announce_body || '', announce_link: s.announce_link || '',
      is_open: s.is_open ?? true, closed_message: s.closed_message || '',
    });
  };
  const loadCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
    setCategories((data as Category[]) || []);
  };
  const loadCustomers = async () => {
    const { data } = await supabase.rpc('get_customers_admin');
    setCustomers((data as CustomerAdmin[]) || []);
  };
  const loadVendors = async () => {
    const { data } = await supabase.from('vendors').select('*').order('created_at', { ascending: false });
    const list = (data as Vendor[]) || [];
    setVendors(list);
    const month = new Date().toISOString().slice(0, 10);
    const stats: typeof vendorStats = {};
    await Promise.all(list.filter(v => v.status === 'approved').map(async v => {
      const { data: stat } = await supabase.rpc('get_vendor_commission', { p_vendor_id: v.id, p_month: month });
      if (stat?.[0]) stats[v.id] = stat[0];
    }));
    setVendorStats(stats);
  };
  const loadCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').is('vendor_id', null).order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) || []);
  };
  const submitCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponSaving(true);
    setCouponError(null);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('coupons').insert({
      code: couponCode.trim().toUpperCase(),
      discount_percent: parseFloat(couponPercent) || 0,
      expires_at: couponExpires || null,
      created_by: user?.id || null,
    });
    if (error) setCouponError(error.message);
    else { setCouponCode(''); setCouponPercent('10'); setCouponExpires(''); loadCoupons(); }
    setCouponSaving(false);
  };
  const toggleCoupon = async (c: Coupon) => {
    await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    setCoupons(cs => cs.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x));
  };
  const deleteCoupon = async (c: Coupon) => {
    if (!confirm(`למחוק את הקופון "${c.code}"?`)) return;
    await supabase.from('coupons').delete().eq('id', c.id);
    setCoupons(cs => cs.filter(x => x.id !== c.id));
  };

  const updateVendorStatus = async (vendor: Vendor, status: Vendor['status']) => {
    await supabase.from('vendors').update({ status }).eq('id', vendor.id);
    setVendors(prev => prev.map(v => v.id === vendor.id ? { ...v, status } : v));
  };
  const loadCategoryRequests = async () => {
    const { data } = await supabase.from('category_requests').select('*, vendor:vendors(*)').order('created_at', { ascending: false });
    setCategoryRequests((data as any) || []);
  };
  const updateCategoryRequest = async (req: CategoryRequest, status: CategoryRequest['status']) => {
    await supabase.from('category_requests').update({ status }).eq('id', req.id);
    setCategoryRequests(prev => prev.map(r => r.id === req.id ? { ...r, status } : r));
  };

  useEffect(() => { loadProducts(); loadOrders(); loadSettings(); loadCustomers(); loadVendors(); loadCategoryRequests(); loadCoupons(); loadCategories(); }, []);

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    setContentSaving(true);
    setContentMsg(null);
    const { error } = await supabase.from('site_settings').upsert({
      id: 1,
      hero_badge: content.hero_badge || null, hero_title: content.hero_title || null, hero_subtitle: content.hero_subtitle || null,
      hero_text: content.hero_text || null, about_text: content.about_text || null,
      announce_enabled: content.announce_enabled, announce_emoji: content.announce_emoji || null,
      announce_title: content.announce_title || null, announce_body: content.announce_body || null, announce_link: content.announce_link || null,
      is_open: content.is_open, closed_message: content.closed_message || null,
    });
    setContentMsg(error ? `שגיאה: ${error.message}` : 'השינויים נשמרו ופורסמו לאתר ✓');
    await loadSettings();
    await reloadSettings();
    setContentSaving(false);
  };

  const handleFaviconFile = async (file: File) => {
    setSavingFavicon(true);
    const compressed = await compressImageFile(file, 128, 0.8);
    await supabase.from('site_settings').upsert({ id: 1, favicon_base64: compressed, favicon_url: null });
    await loadSettings();
    await reloadSettings();
    setSavingFavicon(false);
  };

  const handleCatImageFile = async (file: File) => {
    const compressed = await compressImageFile(file, 600, 0.75);
    setCatForm(f => ({ ...f, image_base64: compressed, image_url: '' }));
  };
  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatSaving(true);
    const payload = {
      name: catForm.name.trim(),
      icon: catForm.icon || null,
      image_url: catForm.image_url || null,
      image_base64: catForm.image_base64 || null,
      sort_order: parseInt(catForm.sort_order) || 0,
      is_featured: catForm.is_featured,
    };
    if (catEditing && catForm.id) await supabase.from('categories').update(payload).eq('id', catForm.id);
    else await supabase.from('categories').upsert(payload, { onConflict: 'name' });
    setCatForm(emptyCategoryForm);
    setCatEditing(false);
    await loadCategories();
    setCatSaving(false);
  };
  const editCategory = (c: Category) => {
    setCatForm({ id: c.id, name: c.name, icon: c.icon || '', image_url: c.image_url || '', image_base64: c.image_base64 || '', sort_order: String(c.sort_order), is_featured: c.is_featured });
    setCatEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const deleteCategory = async (c: Category) => {
    if (!confirm(`למחוק את הקטגוריה "${c.name}"? (לא ימחק מוצרים)`)) return;
    await supabase.from('categories').delete().eq('id', c.id);
    await loadCategories();
  };
  const toggleCategoryFeatured = async (c: Category) => {
    await supabase.from('categories').update({ is_featured: !c.is_featured }).eq('id', c.id);
    await loadCategories();
  };

  const updateCustomerTier = async (c: CustomerAdmin, customer_tier: Profile['customer_tier']) => {
    await supabase.from('profiles').update({ customer_tier }).eq('id', c.id);
    setCustomers(cs => cs.map(x => x.id === c.id ? { ...x, customer_tier } : x));
  };
  const updateCustomerDiscount = async (c: CustomerAdmin, discount_percent: number) => {
    await supabase.from('profiles').update({ discount_percent }).eq('id', c.id);
    setCustomers(cs => cs.map(x => x.id === c.id ? { ...x, discount_percent } : x));
  };
  const toggleCustomerBlocked = async (c: CustomerAdmin) => {
    if (!c.is_blocked && !confirm(`לחסום את "${c.full_name || c.email || 'הלקוח'}" מביצוע הזמנות חדשות?`)) return;
    await supabase.from('profiles').update({ is_blocked: !c.is_blocked }).eq('id', c.id);
    setCustomers(cs => cs.map(x => x.id === c.id ? { ...x, is_blocked: !x.is_blocked } : x));
  };

  const filteredCustomers = customers
    .filter(c => {
      const q = customerSearch.trim().toLowerCase();
      if (!q) return true;
      return (c.full_name || '').toLowerCase().includes(q)
        || (c.email || '').toLowerCase().includes(q)
        || (c.phone || '').toLowerCase().includes(q)
        || (c.address || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      switch (customerSort) {
        case 'name': return (a.full_name || '').localeCompare(b.full_name || '', 'he');
        case 'order_count': return b.order_count - a.order_count;
        case 'total_spent': return b.total_spent - a.total_spent;
        case 'balance': return a.account_balance - b.account_balance;
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const openLedger = async (c: CustomerAdmin) => {
    setLedgerCustomer(c);
    setLedgerAmount('');
    setLedgerNote('');
    const { data } = await supabase.from('account_entries').select('*').eq('user_id', c.id).order('created_at', { ascending: false });
    setLedgerEntries((data as AccountEntry[]) || []);
  };

  const addLedgerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ledgerCustomer) return;
    const amount = parseFloat(ledgerAmount);
    if (!amount) return;
    setLedgerSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('account_entries').insert({ user_id: ledgerCustomer.id, amount, note: ledgerNote || null, created_by: user?.id || null });
    await openLedger(ledgerCustomer);
    setLedgerAmount('');
    setLedgerNote('');
    setLedgerSaving(false);
  };

  const deleteLedgerEntry = async (entry: AccountEntry) => {
    if (!ledgerCustomer || !confirm('למחוק רשומה זו?')) return;
    await supabase.from('account_entries').delete().eq('id', entry.id);
    await openLedger(ledgerCustomer);
  };

  const ledgerBalance = ledgerEntries.reduce((sum, e) => sum + e.amount, 0);

  const SIZE_THRESHOLD = 60_000;

  const optimizeImages = async () => {
    setOptimizing(true);
    setOptimizeMsg(null);
    let count = 0;
    try {
      const { data: prods } = await supabase.from('products').select('id, image_base64').not('image_base64', 'is', null);
      for (const p of (prods as { id: string; image_base64: string | null }[]) || []) {
        if (p.image_base64 && p.image_base64.length > SIZE_THRESHOLD) {
          const compressed = await compressDataUrl(p.image_base64);
          if (compressed.length < p.image_base64.length) {
            await supabase.from('products').update({ image_base64: compressed }).eq('id', p.id);
            count++;
          }
        }
      }
      const { data: promos } = await supabase.from('promotions').select('id, image_base64').not('image_base64', 'is', null);
      for (const p of (promos as { id: string; image_base64: string | null }[]) || []) {
        if (p.image_base64 && p.image_base64.length > SIZE_THRESHOLD) {
          const compressed = await compressDataUrl(p.image_base64);
          if (compressed.length < p.image_base64.length) {
            await supabase.from('promotions').update({ image_base64: compressed }).eq('id', p.id);
            count++;
          }
        }
      }
      if (settings?.logo_base64 && settings.logo_base64.length > SIZE_THRESHOLD) {
        const compressed = await compressDataUrl(settings.logo_base64, 400, 0.75);
        if (compressed.length < settings.logo_base64.length) {
          await supabase.from('site_settings').update({ logo_base64: compressed }).eq('id', 1);
          count++;
          await loadSettings();
        }
      }
      setOptimizeMsg(count > 0 ? `כווצו בהצלחה ${count} תמונות. הטעינה אמורה להיות מהירה יותר.` : 'כל התמונות כבר מאופטמות.');
      loadProducts();
    } catch (err: any) {
      setOptimizeMsg(`שגיאה: ${err.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  const handleLogoFile = async (file: File) => {
    setSavingLogo(true);
    const compressed = await compressImageFile(file, 400, 0.75);
    await supabase.from('site_settings').upsert({ id: 1, logo_base64: compressed, logo_url: null });
    await loadSettings();
    setSavingLogo(false);
  };

  const resetForm = () => { setForm(emptyForm); setEditing(false); };

  const handleImageFile = async (file: File) => {
    const compressed = await compressImageFile(file);
    setForm(f => ({ ...f, image_base64: compressed, image_url: '' }));
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
      if (form.category) await supabase.from('categories').upsert({ name: form.category }, { onConflict: 'name' });
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

      <div className="flex flex-wrap gap-1 bg-amber-50 rounded-3xl p-1.5 w-fit max-w-full mb-10">
        <button onClick={() => setTab('products')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'products' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>מוצרים</button>
        <button onClick={() => setTab('promotions')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'promotions' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>מבצעים ופרסומים</button>
        <button onClick={() => setTab('orders')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'orders' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>הזמנות ({orders.length})</button>
        <button onClick={() => setTab('customers')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'customers' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>לקוחות</button>
        <button onClick={() => setTab('vendors')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'vendors' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>קונדיטוריות שותפות ({vendors.length})</button>
        <button onClick={() => setTab('coupons')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'coupons' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>קופונים</button>
        <button onClick={() => setTab('categories')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'categories' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>קטגוריות</button>
        <button onClick={() => setTab('content')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'content' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>תוכן ועיצוב</button>
        <button onClick={() => setTab('settings')} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${tab === 'settings' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>הגדרות אתר</button>
      </div>

      {tab === 'vendors' ? (
        <div className="space-y-4 animate-fade-in-up">
          {vendors.map(v => {
            const stat = vendorStats[v.id];
            return (
              <div key={v.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-amber-950">{v.name} <span className="text-stone-300 font-normal">/{v.slug}</span></p>
                    <p className="text-xs text-stone-400">{v.area || '—'} · {v.kosher_info || 'ללא פרטי כשרות'} · נרשם {new Date(v.created_at).toLocaleDateString('he-IL')}</p>
                  </div>
                  <select value={v.status} onChange={e => updateVendorStatus(v, e.target.value as Vendor['status'])}
                    className="text-sm font-bold border border-amber-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50 text-amber-900">
                    {Object.entries(vendorStatusLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                  </select>
                </div>
                {v.description && <p className="text-sm text-stone-500 mb-2">{v.description}</p>}
                {v.status === 'approved' && stat && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm bg-amber-50 rounded-xl px-4 py-2.5 mt-2">
                    <span>הזמנות החודש: <strong className="text-amber-950">{stat.order_count}</strong></span>
                    <span>מחזור: <strong className="text-amber-950">₪{stat.total_revenue.toFixed(2)}</strong></span>
                    <span>אחוז עמלה: <strong className="text-amber-800">{(stat.commission_rate * 100).toFixed(0)}%</strong></span>
                    <span>עמלה לגבייה: <strong className="text-amber-800">₪{stat.commission_amount.toFixed(2)}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
          {vendors.length === 0 && <p className="text-stone-400 text-center py-10">אין עדיין בקשות הצטרפות מקונדיטוריות.</p>}
          <p className="text-xs text-stone-400">העמלה היא 10% מכל הזמנה, ויורדת ל-5% החל מההזמנה ה-101 של אותה קונדיטוריה באותו חודש.</p>

          {categoryRequests.length > 0 && (
            <div className="mt-8">
              <h3 className="font-bold text-lg text-amber-950 mb-3">בקשות לקטגוריות חדשות</h3>
              <div className="space-y-2">
                {categoryRequests.map(r => (
                  <div key={r.id} className="bg-white rounded-xl border border-amber-100 shadow-sm p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-amber-950">"{r.requested_name}" <span className="text-stone-300 font-normal">מאת {(r as any).vendor?.name || '—'}</span></p>
                      <p className="text-xs text-stone-400">{new Date(r.created_at).toLocaleDateString('he-IL')}</p>
                    </div>
                    <select value={r.status} onChange={e => updateCategoryRequest(r, e.target.value as CategoryRequest['status'])}
                      className="text-sm font-bold border border-amber-200 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50 text-amber-900">
                      {Object.entries(vendorStatusLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400 mt-2">אישור בקשה מוסיף את הקטגוריה אוטומטית לרשימת הקטגוריות הזמינות לקונדיטוריות.</p>
            </div>
          )}
        </div>
      ) : tab === 'customers' ? (
        <div className="animate-fade-in-up">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[220px]">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300">🔍</span>
              <input value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="חיפוש לפי שם, אימייל, טלפון או כתובת..."
                className="w-full border border-amber-200 rounded-full pr-11 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <select value={customerSort} onChange={e => setCustomerSort(e.target.value as typeof customerSort)}
              className="border border-amber-200 rounded-full px-4 py-2.5 text-sm font-bold text-amber-900 bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="created_at">מיון: נרשמו לאחרונה</option>
              <option value="name">מיון: שם (א-ת)</option>
              <option value="order_count">מיון: הכי הרבה הזמנות</option>
              <option value="total_spent">מיון: הכי הרבה הוצאות</option>
              <option value="balance">מיון: יתרת חשבון (חוב קודם)</option>
            </select>
            <span className="text-sm text-stone-400">{filteredCustomers.length} לקוחות</span>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-amber-900 bg-amber-50">
                <th className="text-right px-5 py-3 font-bold">שם</th>
                <th className="text-right px-5 py-3 font-bold">אימייל</th>
                <th className="text-right px-5 py-3 font-bold">טלפון</th>
                <th className="text-right px-5 py-3 font-bold">כתובת</th>
                <th className="text-right px-5 py-3 font-bold">נרשם</th>
                <th className="text-right px-5 py-3 font-bold">הזמנות</th>
                <th className="text-right px-5 py-3 font-bold">סה״כ הוצאות</th>
                <th className="text-right px-5 py-3 font-bold">סוג לקוח</th>
                <th className="text-right px-5 py-3 font-bold">הנחה אוטומטית (%)</th>
                <th className="text-right px-5 py-3 font-bold">חשבון תשלומים</th>
                <th className="text-right px-5 py-3 font-bold">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id} className={`border-t border-amber-50 ${c.is_blocked ? 'bg-red-50/50' : ''}`}>
                  <td className="px-5 py-3 font-bold text-amber-950 whitespace-nowrap">{c.full_name || '—'} {c.is_admin && <span className="text-xs font-normal text-amber-500">(מנהל)</span>}</td>
                  <td className="px-5 py-3 text-stone-500" dir="ltr">{c.email || '—'}</td>
                  <td className="px-5 py-3 text-stone-500" dir="ltr">{c.phone || '—'}</td>
                  <td className="px-5 py-3 text-stone-500 max-w-[160px] truncate" title={c.address || ''}>{c.address || '—'}</td>
                  <td className="px-5 py-3 text-stone-400 text-xs whitespace-nowrap">{new Date(c.created_at).toLocaleDateString('he-IL')}</td>
                  <td className="px-5 py-3 text-stone-600 text-center">{c.order_count}</td>
                  <td className="px-5 py-3 text-stone-600 whitespace-nowrap">₪{c.total_spent.toFixed(2)}</td>
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
                  <td className="px-5 py-3 whitespace-nowrap">
                    <button onClick={() => openLedger(c)} className="text-sm font-bold text-amber-800 hover:underline">
                      ניהול חשבון {c.account_balance !== 0 && (
                        <span className={c.account_balance < 0 ? 'text-red-600' : 'text-green-700'}> (₪{c.account_balance.toFixed(2)})</span>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <button onClick={() => toggleCustomerBlocked(c)}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${c.is_blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {c.is_blocked ? '🚫 חסום' : '✓ פעיל'}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && <tr><td colSpan={11} className="px-5 py-8 text-center text-stone-400">לא נמצאו לקוחות התואמים לחיפוש.</td></tr>}
            </tbody>
          </table>
          </div>
          <p className="px-1 py-4 text-xs text-stone-400">סוג "סיטונאי" משתמש במחיר הסיטונאי שהוגדר למוצר (אם קיים), אחרת מופעלת ההנחה האוטומטית. סוג "VIP" וגם "רגיל" משתמשים בהנחה האוטומטית בלבד. לקוח "חסום" לא יוכל לשלוח הזמנות חדשות באתר.</p>
        </div>
      ) : tab === 'content' ? (
        <form onSubmit={saveContent} className="max-w-2xl space-y-6 animate-fade-in-up">
          {contentMsg && <p className="bg-amber-50 text-amber-800 text-sm rounded-xl px-4 py-2.5">{contentMsg}</p>}

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4">
            <h2 className="font-bold text-lg text-amber-950">טקסטים בעמוד הבית</h2>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">תגית עליונה (Badge)</label>
              <input value={content.hero_badge} onChange={e => setContent({ ...content, hero_badge: e.target.value })}
                placeholder="קונדיטוריה משפחתית בנתיבות מאז ומתמיד"
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">כותרת ראשית (שורה 1)</label>
                <input value={content.hero_title} onChange={e => setContent({ ...content, hero_title: e.target.value })}
                  placeholder="מגדנות" className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">כותרת מודגשת (שורה 2)</label>
                <input value={content.hero_subtitle} onChange={e => setContent({ ...content, hero_subtitle: e.target.value })}
                  placeholder="בטעם של עוד" className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">טקסט תיאור ראשי</label>
              <textarea rows={3} value={content.hero_text} onChange={e => setContent({ ...content, hero_text: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">טקסט "מה השירות שלנו"</label>
              <textarea rows={4} value={content.about_text} onChange={e => setContent({ ...content, about_text: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-amber-950">חלון קופץ (הודעה ללקוחות)</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={content.announce_enabled} onChange={e => setContent({ ...content, announce_enabled: e.target.checked })} className="w-5 h-5 accent-amber-700" />
                <span className="text-sm font-bold text-amber-900">{content.announce_enabled ? 'מופעל' : 'כבוי'}</span>
              </label>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">אימוג'י</label>
                <EmojiPicker value={content.announce_emoji} onChange={v => setContent({ ...content, announce_emoji: v })} placeholder="📣" />
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-bold text-amber-950 mb-1.5">כותרת ההודעה</label>
                <input value={content.announce_title} onChange={e => setContent({ ...content, announce_title: e.target.value })}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">תוכן ההודעה</label>
              <textarea rows={3} value={content.announce_body} onChange={e => setContent({ ...content, announce_body: e.target.value })}
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">קישור לכפתור <span className="font-normal text-stone-400">(לא חובה)</span></label>
              <input value={content.announce_link} onChange={e => setContent({ ...content, announce_link: e.target.value })} dir="ltr"
                placeholder="https://..." className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <p className="text-xs text-stone-400">החלון יוצג פעם אחת לכל מבקר. שינוי הכותרת או התוכן יציג אותו מחדש.</p>
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-amber-950">סטטוס האתר</h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={content.is_open} onChange={e => setContent({ ...content, is_open: e.target.checked })} className="w-5 h-5 accent-amber-700" />
                <span className={`text-sm font-bold ${content.is_open ? 'text-green-700' : 'text-red-700'}`}>{content.is_open ? 'פתוח להזמנות' : 'סגור'}</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">הודעה כשהאתר סגור</label>
              <input value={content.closed_message} onChange={e => setContent({ ...content, closed_message: e.target.value })}
                placeholder="האתר סגור כעת לקבלת הזמנות. נחזור בקרוב!"
                className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <p className="text-xs text-stone-400">כשהאתר סגור — מוצגת הודעה בראש כל עמוד, וביצוע הזמנות בעגלה נחסם.</p>
          </div>

          <button disabled={contentSaving} className="bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold px-8 py-3 rounded-full transition-colors">
            {contentSaving ? 'שומר...' : 'שמירה ופרסום'}
          </button>
        </form>
      ) : tab === 'categories' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={submitCategory} className="lg:col-span-1 bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4 h-fit animate-fade-in-up">
            <h2 className="font-bold text-lg text-amber-950">{catEditing ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}</h2>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">שם הקטגוריה</label>
              <input required value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="עוגות, חיתוכי פירות..." className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">אימוג'י</label>
                <EmojiPicker value={catForm.icon} onChange={v => setCatForm({ ...catForm, icon: v })} placeholder="🎂" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">סדר הצגה</label>
                <input type="number" value={catForm.sort_order} onChange={e => setCatForm({ ...catForm, sort_order: e.target.value })}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">תמונת רקע (לא חובה)</label>
              <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleCatImageFile(e.target.files[0])}
                className="w-full text-sm text-stone-500 file:ml-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-amber-100 file:text-amber-900 file:font-bold" />
            </div>
            {(catForm.image_url || catForm.image_base64) && (
              <img src={catForm.image_url || catForm.image_base64} alt="תצוגה מקדימה" className="w-full aspect-square object-cover rounded-xl border border-amber-100" />
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={catForm.is_featured} onChange={e => setCatForm({ ...catForm, is_featured: e.target.checked })} className="w-5 h-5 accent-amber-700" />
              <span className="text-sm font-bold text-amber-900">הצגה בעמוד הבית</span>
            </label>
            <div className="flex gap-3">
              <button disabled={catSaving} className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors">
                {catSaving ? 'שומר...' : catEditing ? 'עדכון' : 'הוספה'}
              </button>
              {catEditing && <button type="button" onClick={() => { setCatForm(emptyCategoryForm); setCatEditing(false); }} className="text-stone-500 font-bold px-4">ביטול</button>}
            </div>
            <p className="text-xs text-stone-400">הקטגוריות מקשרות אוטומטית לתפריט המסונן. מוצרים משויכים לקטגוריה לפי שם הקטגוריה בכרטיס המוצר.</p>
          </form>

          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden animate-fade-in-up">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-rose-50 flex items-center justify-center relative">
                  {categoryImage(c) ? <img src={categoryImage(c)} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-5xl">{c.icon || '🧁'}</span>}
                </div>
                <div className="p-3">
                  <p className="font-bold text-amber-950 text-sm truncate">{c.icon} {c.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <button onClick={() => toggleCategoryFeatured(c)} className={`font-bold px-2 py-0.5 rounded-full ${c.is_featured ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{c.is_featured ? 'בעמוד הבית' : 'מוסתר'}</button>
                    <button onClick={() => editCategory(c)} className="font-bold text-amber-700 hover:underline">עריכה</button>
                    <button onClick={() => deleteCategory(c)} className="font-bold text-red-600 hover:underline">מחיקה</button>
                  </div>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="col-span-full text-stone-400 text-center py-10">אין עדיין קטגוריות. הוסיפו את הראשונה!</p>}
          </div>
        </div>
      ) : tab === 'settings' ? (
        <>
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

        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 max-w-md animate-fade-in-up mt-6">
          <h2 className="font-bold text-lg text-amber-950 mb-4">אייקון האתר (Favicon)</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center overflow-hidden">
              {siteFavicon(settings) ? <img src={siteFavicon(settings)} alt="אייקון" className="w-full h-full object-cover" /> : <span className="text-3xl">🍰</span>}
            </div>
            <label className="cursor-pointer bg-amber-800 hover:bg-amber-900 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
              {savingFavicon ? 'שומר...' : 'העלאת אייקון'}
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFaviconFile(e.target.files[0])} />
            </label>
          </div>
          <p className="text-xs text-stone-400">התמונה הקטנה שמופיעה בלשונית הדפדפן וליד כתובת האתר. מומלץ תמונה ריבועית פשוטה.</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 max-w-md animate-fade-in-up mt-6">
          <h2 className="font-bold text-lg text-amber-950 mb-2">אופטימיזציית תמונות</h2>
          <p className="text-xs text-stone-400 mb-4">תמונות גדולות שהועלו בעבר עלולות להאט את טעינת האתר ללקוחות. לחיצה כאן תכווץ אוטומטית את כל התמונות הגדולות שנשמרו במערכת (מוצרים, מבצעים ולוגו) — לא תפגע באיכות התצוגה.</p>
          <button onClick={optimizeImages} disabled={optimizing}
            className="bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors">
            {optimizing ? 'מכווץ תמונות...' : 'כיווץ תמונות קיימות'}
          </button>
          {optimizeMsg && <p className="text-sm text-amber-800 mt-3">{optimizeMsg}</p>}
        </div>
        </>
      ) : tab === 'coupons' ? (
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={submitCoupon} className="lg:col-span-1 bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4 h-fit animate-fade-in-up">
            <h2 className="font-bold text-lg text-amber-950">קופון חדש (כלל-אתרי)</h2>
            {couponError && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2.5">{couponError}</p>}
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">קוד קופון</label>
              <input value={couponCode} onChange={e => setCouponCode(e.target.value)} required dir="ltr"
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="SUMMER10" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">אחוז הנחה</label>
              <input type="number" min="1" max="100" value={couponPercent} onChange={e => setCouponPercent(e.target.value)} required
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">תוקף עד <span className="font-normal text-stone-400">(לא חובה)</span></label>
              <input type="date" value={couponExpires} onChange={e => setCouponExpires(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <button disabled={couponSaving} className="w-full bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors">{couponSaving ? 'יוצר...' : 'יצירת קופון'}</button>
            <p className="text-xs text-stone-400">קופונים אלו תקפים בכל האתר, לכל המוצרים. כל קונדיטוריה יכולה ליצור קופונים נפרדים שיעבדו רק על המוצרים שלה, מתוך לוח הבקרה שלה.</p>
          </form>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-amber-100 shadow-sm overflow-x-auto animate-fade-in-up h-fit">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-amber-900 bg-amber-50">
                  <th className="text-right px-5 py-3 font-bold">קוד</th>
                  <th className="text-right px-5 py-3 font-bold">הנחה</th>
                  <th className="text-right px-5 py-3 font-bold">תוקף</th>
                  <th className="text-right px-5 py-3 font-bold">סטטוס</th>
                  <th className="text-right px-5 py-3 font-bold"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(c => (
                  <tr key={c.id} className="border-t border-amber-50">
                    <td className="px-5 py-3 font-bold text-amber-950" dir="ltr">{c.code}</td>
                    <td className="px-5 py-3 text-stone-600">{c.discount_percent}%</td>
                    <td className="px-5 py-3 text-stone-500 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('he-IL') : 'ללא הגבלה'}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleCoupon(c)} className={`text-xs font-bold px-3 py-1 rounded-full ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-500'}`}>{c.is_active ? 'פעיל' : 'מושבת'}</button>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteCoupon(c)} className="text-xs text-stone-400 hover:text-red-600">מחיקה</button>
                    </td>
                  </tr>
                ))}
                {coupons.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-stone-400">אין עדיין קופונים כלל-אתריים.</td></tr>}
              </tbody>
            </table>
          </div>
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
                  {o.payment_method && <p className="text-xs font-bold text-amber-700 mt-0.5">אופן תשלום שנבחר: {paymentLabels[o.payment_method] || o.payment_method}</p>}
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

      {ledgerCustomer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setLedgerCustomer(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-xl text-amber-950">חשבון תשלומים — {ledgerCustomer.full_name || 'לקוח'}</h3>
              <button onClick={() => setLedgerCustomer(null)} className="text-stone-400 hover:text-stone-600 text-xl leading-none">✕</button>
            </div>
            <p className={`font-extrabold text-lg mb-4 ${ledgerBalance < 0 ? 'text-red-600' : 'text-green-700'}`}>
              {ledgerBalance < 0 ? `חוב: ₪${Math.abs(ledgerBalance).toFixed(2)}` : `יתרה: ₪${ledgerBalance.toFixed(2)}`}
            </p>
            <form onSubmit={addLedgerEntry} className="flex flex-wrap gap-2 mb-5">
              <input type="number" step="0.01" value={ledgerAmount} onChange={e => setLedgerAmount(e.target.value)} placeholder="סכום (חיובי=זיכוי, שלילי=חיוב)"
                className="flex-1 min-w-[160px] border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <input value={ledgerNote} onChange={e => setLedgerNote(e.target.value)} placeholder="הערה (לא חובה)"
                className="flex-1 min-w-[160px] border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              <button disabled={ledgerSaving} className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-5 py-2 rounded-full transition-colors text-sm">{ledgerSaving ? 'שומר...' : 'הוספה'}</button>
            </form>
            <ul className="text-sm divide-y divide-amber-50">
              {ledgerEntries.map(en => (
                <li key={en.id} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-stone-600">{en.note || (en.amount >= 0 ? 'זיכוי' : 'חיוב')}</p>
                    <p className="text-xs text-stone-400">{new Date(en.created_at).toLocaleString('he-IL')}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold whitespace-nowrap ${en.amount < 0 ? 'text-red-600' : 'text-green-700'}`}>{en.amount >= 0 ? '+' : ''}₪{en.amount.toFixed(2)}</span>
                    <button onClick={() => deleteLedgerEntry(en)} className="text-xs text-stone-400 hover:text-red-600">מחיקה</button>
                  </div>
                </li>
              ))}
              {ledgerEntries.length === 0 && <li className="py-3 text-stone-400 text-center">אין עדיין רשומות בחשבון זה.</li>}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
