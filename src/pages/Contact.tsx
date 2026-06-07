import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendContactEmail } from '../lib/supabase';

export const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSending(true);
    try {
      await sendContactEmail({ type: 'contact', name: form.name, phone: form.phone, message: form.message });
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <div className="text-center mb-14 animate-fade-in-up">
        <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-4">צור קשר</span>
        <h1 className="font-extrabold text-4xl sm:text-5xl text-amber-950 mb-4">נשמח לשמוע מכם</h1>
        <p className="text-stone-500">לשאלות, הזמנות מיוחדות ואירועים — אנחנו כאן.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
            <span className="text-3xl">📍</span>
            <div><p className="font-bold text-amber-950">כתובת</p><p className="text-stone-500 text-sm">הרב חזני 1, נתיבות</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
            <span className="text-3xl">📞</span>
            <div><p className="font-bold text-amber-950">טלפון</p><p className="text-stone-500 text-sm" dir="ltr">077-2269702</p><p className="text-stone-400 text-xs mt-0.5" dir="ltr">פנייה אישית למנהל: 055-5615243</p></div>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300">
            <span className="text-3xl">🕗</span>
            <div><p className="font-bold text-amber-950">שעות פתיחה</p><p className="text-stone-500 text-sm">שישי 09:00–10:00, ובתיאום מראש לאירועים והזמנות</p></div>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 space-y-4 animate-fade-in-up [animation-delay:150ms]">
          {sent ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-3">🎉</p>
              <p className="font-bold text-amber-950 text-lg">תודה רבה!</p>
              <p className="text-stone-500 text-sm mt-1">ההודעה שלכם נשלחה אלינו. נחזור אליכם בהקדם.</p>
            </div>
          ) : (
            <>
              {error && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3">{error}</p>}
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">שם מלא</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">טלפון</label>
                <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr"
                  className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">הודעה</label>
                <textarea required rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow resize-none" />
              </div>
              <p className="text-[11px] leading-relaxed text-stone-400">
                מסירת הפרטים אינה חובה על פי דין, אך נדרשת לשם מענה לפנייתכם; בעל השליטה במאגר המידע הוא מגדנות בטעם של עוד, נתיבות. המידע ישמש לשם יצירת קשר עימכם בלבד ולא יועבר לצדדים שלישיים מלבד ספקי שירות הנדרשים לתפעול האתר. עומדת לכם הזכות לעיין במידע ולבקש את תיקונו, בהתאם ל<Link to="/privacy-policy" className="underline hover:text-amber-700">מדיניות הפרטיות</Link>.
              </p>
              <button disabled={sending} className="w-full bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow transition-all duration-300 hover:-translate-y-0.5">{sending ? 'שולח...' : 'שליחה'}</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
