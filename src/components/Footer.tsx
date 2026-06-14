import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => (
  <footer className="bg-amber-950 text-amber-100/80 mt-24">
    <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
      <div>
        <p className="text-2xl text-white font-extrabold mb-2">בטעם של עוד</p>
        <p className="text-sm leading-relaxed">קונדיטוריה משפחתית בלב נתיבות, אופים בכל הלב כל מה שמתוק וטעים — לאירועים, לשמחות ולכל יום.</p>
      </div>
      <div>
        <p className="font-bold text-white mb-3">ניווט מהיר</p>
        <ul className="space-y-2 text-sm">
          <li><Link to="/menu" className="hover:text-white transition-colors">התפריט שלנו</Link></li>
          <li><Link to="/about" className="hover:text-white transition-colors">אודות</Link></li>
          <li><Link to="/contact" className="hover:text-white transition-colors">צור קשר</Link></li>
          <li><Link to="/login" className="hover:text-white transition-colors">התחברות / הרשמה</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-white transition-colors">מדיניות פרטיות</Link></li>
          <li><Link to="/accessibility" className="hover:text-white transition-colors">הצהרת נגישות</Link></li>
          <li><Link to="/data-deletion" className="hover:text-white transition-colors">מחיקת נתונים אישיים</Link></li>
        </ul>
      </div>
      <div>
        <p className="font-bold text-white mb-3">פרטי התקשרות</p>
        <ul className="space-y-2 text-sm">
          <li>📍 הרב חזני 1, נתיבות</li>
          <li>📞 077-2269702</li>
          <li>🕗 שישי: 09:00–10:00, ולפי תיאום מראש</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-amber-900/60 py-5 text-center text-xs text-amber-200/50 space-y-1.5">
      <p>© {new Date().getFullYear()} מגדנות בטעם של עוד — כל הזכויות שמורות</p>
      <p>
        <a href="https://2269702.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-100 transition-colors">
          🌐 עיצוב ובניית האתר: <span dir="ltr">2269702.xyz</span> — Website Design &amp; Development
        </a>
      </p>
    </div>
  </footer>
);
