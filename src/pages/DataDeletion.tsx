import React, { useState } from 'react';
import { sendContactEmail } from '../lib/supabase';

export const DataDeletion: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await sendContactEmail({
        type: 'data-deletion',
        email,
        message: `בקשה למחיקת כל הנתונים האישיים מאתר מגדנות בטעם של עוד.\nכתובת המייל הרשומה בחשבון: ${email}`,
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="text-center mb-10 animate-fade-in-up">
        <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-4">פרטיות ומחיקת נתונים</span>
        <h1 className="font-extrabold text-4xl text-amber-950 mb-4">בקשה למחיקת מידע אישי</h1>
        <p className="text-stone-500 leading-relaxed">
          אם הירשמתם לאתר "מגדנות בטעם של עוד" (כולל הרשמה דרך Google או Facebook) ותרצו למחוק את כל המידע האישי שנשמר אצלנו —
          לרבות פרטי חשבון, פרופיל והיסטוריית הזמנות — תוכלו לשלוח לנו בקשה ונטפל בה תוך זמן סביר.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 animate-fade-in-up">
        {sent ? (
          <div className="text-center py-6">
            <p className="text-5xl mb-3">📧</p>
            <p className="font-bold text-amber-950 text-lg">הבקשה נשלחה אלינו ישירות</p>
            <p className="text-stone-500 text-sm mt-1">נטפל בבקשתכם למחיקת המידע האישי תוך זמן סביר.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</p>}
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">כתובת המייל הרשומה בחשבון שלכם</label>
              <input type="email" required dir="ltr" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <button disabled={sending} className="w-full bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow transition-all duration-300 hover:-translate-y-0.5">
              {sending ? 'שולח...' : 'שליחת בקשת מחיקה'}
            </button>
          </form>
        )}
      </div>

      <p className="text-center text-sm text-stone-400 mt-8">
        ניתן גם לפנות אלינו ישירות בכתובת <span dir="ltr" className="font-bold text-amber-800">info@2269702.xyz</span> או בטלפון 077-2269702, ובקשתכם תטופל בהקדם.
      </p>
    </div>
  );
};
