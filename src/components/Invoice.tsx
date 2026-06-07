import React from 'react';
import { Order } from '../lib/supabase';

export const Invoice: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 animate-fade-in-up" onClick={e => e.stopPropagation()} id="invoice-print">
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-amber-100">
          <div>
            <p className="font-extrabold text-2xl text-amber-950">חשבונית מס / קבלה</p>
            <p className="text-sm text-stone-400 mt-1">מגדנות בטעם של עוד · נתיבות</p>
          </div>
          <span className="text-3xl">🧾</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm mb-6">
          <div><p className="text-stone-400">מספר חשבונית</p><p className="font-bold text-amber-950">{order.invoice_number || order.id.slice(0, 8)}</p></div>
          <div><p className="text-stone-400">תאריך</p><p className="font-bold text-amber-950">{new Date(order.created_at).toLocaleDateString('he-IL')}</p></div>
          <div><p className="text-stone-400">לקוח</p><p className="font-bold text-amber-950">{order.customer_name || '—'}</p></div>
          <div><p className="text-stone-400">טלפון</p><p className="font-bold text-amber-950" dir="ltr">{order.customer_phone || '—'}</p></div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="text-stone-400 border-b border-amber-100">
              <th className="text-right font-medium py-2">פריט</th>
              <th className="text-center font-medium py-2">כמות</th>
              <th className="text-center font-medium py-2">מחיר יח׳</th>
              <th className="text-left font-medium py-2">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {order.order_items?.map(it => (
              <tr key={it.id} className="border-b border-amber-50">
                <td className="py-2 text-amber-950">{it.product_name}</td>
                <td className="py-2 text-center">{it.quantity}</td>
                <td className="py-2 text-center">₪{it.unit_price.toFixed(2)}</td>
                <td className="py-2 text-left font-bold">₪{(it.unit_price * it.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center pt-4 border-t border-amber-100 mb-8">
          <span className="font-bold text-lg text-amber-950">סה״כ לתשלום</span>
          <span className="font-extrabold text-2xl text-amber-800">₪{order.total.toFixed(2)}</span>
        </div>

        <div className="flex gap-3 print:hidden">
          <button onClick={() => window.print()} className="flex-1 bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl transition-colors">הדפסה / שמירה כ-PDF</button>
          <button onClick={onClose} className="flex-1 border-2 border-amber-800 text-amber-900 font-bold py-3 rounded-xl hover:bg-amber-50 transition-colors">סגירה</button>
        </div>
      </div>
    </div>
  );
};
