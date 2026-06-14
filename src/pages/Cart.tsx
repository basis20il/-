import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { supabase, effectivePrice, Coupon } from '../lib/supabase';

export const Cart: React.FC = () => {
  const { lines, setQuantity, remove, clear, total } = useCart();
  const { session, profile } = useAuth();
  const { settings } = useSettings();
  const siteClosed = settings ? !settings.is_open : false;
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'google_pay' | 'cash'>('card');
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const lineDiscount = (productVendorId: string | null) => {
    if (!coupon) return 0;
    if (coupon.vendor_id && coupon.vendor_id !== productVendorId) return 0;
    return coupon.discount_percent;
  };

  const discountedTotal = lines.reduce((sum, l) => {
    const price = effectivePrice(l.product, profile);
    const pct = lineDiscount(l.product.vendor_id || null);
    return sum + price * (1 - pct / 100) * l.quantity;
  }, 0);

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(true);
    setCouponMsg(null);
    const { data } = await supabase.from('coupons').select('*').eq('code', code).eq('is_active', true);
    const list = (data as Coupon[]) || [];
    const valid = list.find(c => !c.expires_at || new Date(c.expires_at) >= new Date());
    if (!valid) {
      setCoupon(null);
      setCouponMsg('קוד קופון לא נמצא, אינו בתוקף, או שפג תוקפו.');
    } else if (valid.vendor_id && !lines.some(l => l.product.vendor_id === valid.vendor_id)) {
      setCoupon(null);
      setCouponMsg('הקופון תקף רק עבור מוצרים מקונדיטוריה מסוימת שאינה בעגלה שלכם.');
    } else {
      setCoupon(valid);
      setCouponMsg(valid.vendor_id ? `הקופון הופעל — הנחה של ${valid.discount_percent}% על מוצרי הקונדיטוריה הרלוונטית.` : `הקופון הופעל — הנחה של ${valid.discount_percent}% על כל ההזמנה.`);
    }
    setCheckingCoupon(false);
  };

  const placeOrder = async () => {
    if (siteClosed) { setError(settings?.closed_message || 'האתר סגור כעת לקבלת הזמנות. נסו שוב מאוחר יותר.'); return; }
    if (!session) { navigate('/login', { state: { from: '/cart' } }); return; }
    setPlacing(true);
    setError(null);
    try {
      const groups = new Map<string | null, typeof lines>();
      for (const l of lines) {
        const key = l.product.vendor_id || null;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(l);
      }

      let i = 0;
      for (const [vendorId, groupLines] of groups) {
        const groupTotal = groupLines.reduce((sum, l) => {
          const pct = lineDiscount(l.product.vendor_id || null);
          return sum + effectivePrice(l.product, profile) * (1 - pct / 100) * l.quantity;
        }, 0);
        const invoiceNumber = `INV-${Date.now().toString().slice(-8)}${i ? `-${i}` : ''}`;
        i++;
        const { data: order, error: orderErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          customer_name: profile?.full_name || session.user.email,
          customer_phone: profile?.phone,
          total: groupTotal,
          notes: notes || null,
          pickup_date: pickupDate || null,
          invoice_number: invoiceNumber,
          payment_method: paymentMethod,
          vendor_id: vendorId,
          status: 'pending',
        }).select().single();
        if (orderErr) throw orderErr;

        const items = groupLines.map(l => ({
          order_id: order.id,
          product_id: l.product.id,
          product_name: l.product.name,
          unit_price: effectivePrice(l.product, profile) * (1 - lineDiscount(l.product.vendor_id || null) / 100),
          quantity: l.quantity,
        }));
        const { error: itemsErr } = await supabase.from('order_items').insert(items);
        if (itemsErr) throw itemsErr;
      }

      clear();
      setDone(true);
    } catch (err: any) {
      setError(err.message?.includes('blocked') ? 'החשבון שלך חסום מביצוע הזמנות. לפרטים נוספים פנו אלינו.' : err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-xl mx-auto px-6 py-28 text-center animate-fade-in-up">
        <p className="text-6xl mb-4">🎉</p>
        <h1 className="font-extrabold text-3xl text-amber-950 mb-3">ההזמנה התקבלה בהצלחה!</h1>
        <p className="text-stone-500 mb-8">נחזור אליכם בהקדם לתיאום פרטי האיסוף/המשלוח. תודה שבחרתם בנו ❤️</p>
        <div className="flex justify-center gap-4">
          <Link to="/account" className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-6 py-3 rounded-full transition-colors">ההזמנות שלי</Link>
          <Link to="/menu" className="border-2 border-amber-800 text-amber-900 font-bold px-6 py-3 rounded-full hover:bg-amber-50 transition-colors">המשך קנייה</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-extrabold text-4xl text-amber-950 mb-10 text-center animate-fade-in-up">העגלה שלי</h1>

      {lines.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-stone-500 mb-6">העגלה שלכם ריקה כרגע.</p>
          <Link to="/menu" className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-8 py-3 rounded-full transition-colors">למעבר לתפריט</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {lines.map(l => (
              <div key={l.product.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center gap-4 animate-fade-in-up">
                <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">🧁</div>
                <div className="flex-1">
                  <p className="font-bold text-amber-950">{l.product.name}</p>
                  <p className="text-sm text-amber-700">₪{effectivePrice(l.product, profile).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(l.product.id, l.quantity - 1)} className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 font-bold text-amber-900 transition-colors">−</button>
                  <span className="w-6 text-center font-bold">{l.quantity}</span>
                  <button onClick={() => setQuantity(l.product.id, l.quantity + 1)} className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 font-bold text-amber-900 transition-colors">+</button>
                </div>
                <p className="font-bold text-amber-950 w-20 text-left">₪{(effectivePrice(l.product, profile) * l.quantity).toFixed(2)}</p>
                <button onClick={() => remove(l.product.id)} className="text-stone-300 hover:text-red-600 transition-colors text-xl">✕</button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 h-fit space-y-4 animate-fade-in-up">
            <h2 className="font-bold text-lg text-amber-950">סיכום הזמנה</h2>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">תאריך איסוף/אספקה רצוי</label>
              <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">הערות להזמנה</label>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" placeholder="לדוגמה: ללא אגוזים, כיתוב על העוגה..." />
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">אופן תשלום</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'card', label: 'כרטיס אשראי', node: <span>💳</span> },
                  { key: 'apple_pay', label: 'Apple Pay', node: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M16.498 0c.12 1.214-.36 2.396-1.024 3.255-.69.88-1.832 1.566-2.95 1.475-.144-1.166.41-2.396 1.05-3.157C14.293.756 15.484.06 16.498 0zm4.402 17.59c-.404.93-.6 1.347-1.12 2.17-.726 1.158-1.75 2.6-3.018 2.61-1.13.012-1.42-.735-2.954-.726-1.534.01-1.853.74-2.984.728-1.27-.012-2.24-1.31-2.967-2.467-2.034-3.207-2.25-6.97-.992-8.97.892-1.42 2.302-2.252 3.628-2.252 1.35 0 2.198.74 3.314.74 1.082 0 1.74-.742 3.314-.742 1.18 0 2.43.643 3.32 1.755-2.92 1.6-2.45 5.77.46 7.155z"/></svg>
                  ) },
                  { key: 'google_pay', label: 'Google Pay', node: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="#4285F4" d="M11.5 12.27v3.55h4.93c-.2 1.18-.84 2.18-1.8 2.85v2.36h2.9c1.7-1.56 2.68-3.87 2.68-6.6 0-.64-.06-1.25-.16-1.84l-8.55.01z"/><path fill="#34A853" d="M6.66 14.31l-.65.5-2.3 1.78c1.45 2.87 4.42 4.85 7.8 4.85 2.36 0 4.34-.78 5.79-2.12l-2.9-2.36c-.78.52-1.78.83-2.9.83-2.23 0-4.12-1.5-4.8-3.52z"/><path fill="#FBBC05" d="M3.71 8.61a7.95 7.95 0 0 0 0 6.78l2.95-2.28a4.78 4.78 0 0 1 0-3.05L3.71 8.61z"/><path fill="#EA4335" d="M11.5 7.38c1.22 0 2.32.42 3.18 1.24l2.6-2.6C15.83 4.6 13.86 3.79 11.5 3.79c-3.38 0-6.35 1.98-7.8 4.84l2.95 2.28c.68-2.02 2.57-3.53 4.8-3.53z"/></svg>
                  ) },
                  { key: 'cash', label: 'מזומן', node: <span>💵</span> },
                ].map(opt => (
                  <button key={opt.key} type="button" onClick={() => setPaymentMethod(opt.key as typeof paymentMethod)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-colors ${paymentMethod === opt.key ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-white border-amber-200 text-stone-600 hover:bg-amber-50'}`}>
                    {opt.node}{opt.label}
                  </button>
                ))}
              </div>
              {paymentMethod === 'card' && (
                <div className="mt-3 bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <input type="text" inputMode="numeric" placeholder="מספר כרטיס" disabled
                    className="flex-1 min-w-0 border border-amber-200 rounded-lg px-2.5 py-1.5 text-sm bg-white disabled:opacity-70" dir="ltr" />
                  <input type="text" placeholder="MM/YY" disabled
                    className="w-16 border border-amber-200 rounded-lg px-2 py-1.5 text-sm bg-white disabled:opacity-70 text-center" dir="ltr" />
                  <input type="text" placeholder="CVV" disabled
                    className="w-14 border border-amber-200 rounded-lg px-2 py-1.5 text-sm bg-white disabled:opacity-70 text-center" dir="ltr" />
                </div>
              )}
              {paymentMethod === 'card' && (
                <p className="mt-1.5 text-[11px] text-stone-400">תצוגה לדוגמה — החיוב בפועל יתואם איתכם אישית.</p>
              )}
              {paymentMethod === 'cash' && (
                <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">שימו לב: בבחירה בתשלום במזומן, הליך ההזמנה ימתין לתשלום.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">קוד קופון</label>
              <div className="flex gap-2">
                <input value={couponInput} onChange={e => setCouponInput(e.target.value)} dir="ltr" placeholder="הזינו קוד קופון"
                  className="flex-1 border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                <button type="button" onClick={applyCoupon} disabled={checkingCoupon}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-60">{checkingCoupon ? '...' : 'החלה'}</button>
              </div>
              {couponMsg && <p className={`text-xs mt-1.5 ${coupon ? 'text-green-700' : 'text-red-600'}`}>{couponMsg}</p>}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-amber-100">
              <span className="font-bold text-amber-950">סה״כ לתשלום</span>
              <div className="text-left">
                {coupon && <p className="text-xs text-stone-400 line-through">₪{total.toFixed(2)}</p>}
                <span className="font-extrabold text-2xl text-amber-800">₪{discountedTotal.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-400">
              מסירת הפרטים אינה חובה על פי דין, אך נדרשת לשם ביצוע ההזמנה ויצירת קשר עימכם לתיאום אספקה/איסוף; בעל השליטה במאגר המידע הוא מגדנות בטעם של עוד, נתיבות. המידע ישמש לניהול ההזמנה והשירות בלבד ולא יועבר לצדדים שלישיים מלבד ספקי שירות הנדרשים לתפעול האתר. עומדת לכם הזכות לעיין במידע ולבקש את תיקונו, בהתאם ל<Link to="/privacy-policy" className="underline hover:text-amber-700">מדיניות הפרטיות</Link>.
            </p>
            {siteClosed && <p className="text-amber-800 bg-amber-50 rounded-xl px-4 py-2.5 text-sm font-medium">🕒 {settings?.closed_message || 'האתר סגור כעת לקבלת הזמנות. נחזור בקרוב!'}</p>}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button onClick={placeOrder} disabled={placing || siteClosed}
              className="w-full bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow transition-all duration-300 hover:-translate-y-0.5">
              {siteClosed ? 'האתר סגור כעת' : placing ? 'שולח הזמנה...' : session ? 'שליחת הזמנה' : 'התחברות לשליחת הזמנה'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
