import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export const Cart: React.FC = () => {
  const { lines, setQuantity, remove, clear, total } = useCart();
  const { session, profile } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const placeOrder = async () => {
    if (!session) { navigate('/login'); return; }
    setPlacing(true);
    setError(null);
    try {
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        user_id: session.user.id,
        customer_name: profile?.full_name || session.user.email,
        customer_phone: profile?.phone,
        total,
        notes: notes || null,
        pickup_date: pickupDate || null,
        invoice_number: invoiceNumber,
        status: 'pending',
      }).select().single();
      if (orderErr) throw orderErr;

      const items = lines.map(l => ({
        order_id: order.id,
        product_id: l.product.id,
        product_name: l.product.name,
        unit_price: l.product.price,
        quantity: l.quantity,
      }));
      const { error: itemsErr } = await supabase.from('order_items').insert(items);
      if (itemsErr) throw itemsErr;

      clear();
      setDone(true);
    } catch (err: any) {
      setError(err.message);
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
                  <p className="text-sm text-amber-700">₪{l.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(l.product.id, l.quantity - 1)} className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 font-bold text-amber-900 transition-colors">−</button>
                  <span className="w-6 text-center font-bold">{l.quantity}</span>
                  <button onClick={() => setQuantity(l.product.id, l.quantity + 1)} className="w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 font-bold text-amber-900 transition-colors">+</button>
                </div>
                <p className="font-bold text-amber-950 w-20 text-left">₪{(l.product.price * l.quantity).toFixed(2)}</p>
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
            <div className="flex justify-between items-center pt-2 border-t border-amber-100">
              <span className="font-bold text-amber-950">סה״כ לתשלום</span>
              <span className="font-extrabold text-2xl text-amber-800">₪{total.toFixed(2)}</span>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button onClick={placeOrder} disabled={placing}
              className="w-full bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow transition-all duration-300 hover:-translate-y-0.5">
              {placing ? 'שולח הזמנה...' : session ? 'שליחת הזמנה' : 'התחברות לשליחת הזמנה'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
