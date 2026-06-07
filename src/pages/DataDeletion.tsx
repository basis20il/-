import React, { useState } from 'react';

export const DataDeletion: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:info@2269702.xyz?subject=${encodeURIComponent('בקשה למחיקת נתונים אישיים')}&body=${encodeURIComponent(`שלום,\nאני מבקש/ת למחוק את כל הנתונים האישיים שלי מאתר מגדנות בטעם של עוד.\nכתובת המייל הרשומה בחשבון: ${email}`)}`;
    setSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="text-center mb-10 animate-fade-in-up">
        <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-4">פרטיות ומחיקת נתונים</span>
        <h1 className="font-serif text-4xl font-bold text-amber-950 mb-4">בקשה למחיקת מידע אישי</h1>
        <p className="text-stone-500 leading-relaxed">
          אם הירשמתם לאתר "מגדנות בטעם של עוד" (כולל הרשמה דרך Google או Facebook) ותרצו למחוק את כל המידע האישי שנשמר אצלנו —
          לרבות פרטי חשבון, פרופיל והיסטוריית הזמנות — תוכלו לשלוח לנו בקשה ונטפל בה תוך זמן סביר.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 animate-fade-in-up">
        {sent ? (
          <div className="text-center py-6">
            <p className="text-5xl mb-3">📧</p>
            <p className="font-bold text-amber-950 text-lg">נפתחה עבורכם הודעת מייל</p>
            <p className="text-stone-500 text-sm mt-1">אם לא נפתח אצלכם תוכנת מייל אוטומטית, אפשר לשלוח ידנית לכתובת <span dir="ltr" className="font-bold">info@2269702.xyz</span></p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-amber-950 mb-1.5">כתובת המייל הרשומה בחשבון שלכם</label>
              <input type="email" required dir="ltr" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <button className="w-full bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 rounded-xl shadow transition-all duration-300 hover:-translate-y-0.5">
              שליחת בקשת מחיקה למייל info@2269702.xyz
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
