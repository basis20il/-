import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadAnalytics } from '../lib/analytics';

const STORAGE_KEY = 'migdanot_cookie_consent_v1';

export type CookiePrefs = { necessary: true; analytics: boolean; marketing: boolean };

export const getCookiePrefs = (): CookiePrefs | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const existing = getCookiePrefs();
    if (!existing) setVisible(true);
    else if (existing.analytics) loadAnalytics();
  }, []);

  const save = (prefs: CookiePrefs) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    if (prefs.analytics) loadAnalytics();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 animate-fade-in-up">
      <div className="max-w-3xl mx-auto bg-white border border-amber-200 rounded-2xl shadow-2xl p-6 sm:p-7">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">🍪</span>
          <div>
            <h3 className="font-bold text-amber-950 text-lg mb-1">האתר הזה עוקב אחריכם — בידיעתכם המלאה</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              אנו משתמשים בעוגיות (Cookies), באחסון מקומי, ובכלי מעקב וניתוח גלישה (כגון Google Analytics, Google Tag Manager, Microsoft Clarity, ContentSquare ו-Cloudflare Analytics) שמתעדים כיצד אתם גולשים באתר.
              עוגיות הכרחיות לתפעול האתר (כגון התחברות ועגלת קניות) פעילות תמיד ואינן ניתנות לכיבוי.
              <strong> כלי המעקב והניתוח לעיל יופעלו רק אם תלחצו על "אישור הכל" או תאשרו זאת באופן מפורש בהתאמה אישית — אם אינכם מעוניינים שנעקוב אחרי הגלישה שלכם, פשוט לחצו "דחיית הכל".</strong> לפרטים מלאים ראו את <Link to="/privacy-policy" className="font-bold text-amber-800 hover:underline">מדיניות הפרטיות והעוגיות</Link> שלנו.
            </p>
          </div>
        </div>

        {customizing && (
          <div className="space-y-3 mb-4 bg-amber-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-amber-950">הכרחיות</p>
                <p className="text-xs text-stone-500">נדרשות לתפעול בסיסי של האתר — תמיד פעילות</p>
              </div>
              <input type="checkbox" checked disabled className="w-5 h-5 accent-amber-700" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-amber-950">אנליטיקה ומעקב גלישה</p>
                <p className="text-xs text-stone-500">מפעילות את Google Analytics, Google Tag Manager, Microsoft Clarity, ContentSquare ו-Cloudflare Analytics, שמתעדים את אופן השימוש שלכם באתר</p>
              </div>
              <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="w-5 h-5 accent-amber-700" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-amber-950">שיווק</p>
                <p className="text-xs text-stone-500">לצורך התאמת פרסומות ותוכן רלוונטי עבורכם</p>
              </div>
              <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="w-5 h-5 accent-amber-700" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {customizing ? (
            <button onClick={() => save({ necessary: true, analytics, marketing })}
              className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-6 py-2.5 rounded-full transition-colors">שמירת ההעדפות</button>
          ) : (
            <>
              <button onClick={() => save({ necessary: true, analytics: true, marketing: true })}
                className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-6 py-2.5 rounded-full transition-colors">אישור הכל</button>
              <button onClick={() => save({ necessary: true, analytics: false, marketing: false })}
                className="bg-white border border-amber-300 text-amber-900 font-bold px-6 py-2.5 rounded-full hover:bg-amber-50 transition-colors">דחיית הכל</button>
              <button onClick={() => setCustomizing(true)}
                className="text-amber-800 font-bold px-4 py-2.5 hover:underline">התאמה אישית</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
