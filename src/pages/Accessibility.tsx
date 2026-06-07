import React from 'react';

export const Accessibility: React.FC = () => (
  <div className="max-w-3xl mx-auto px-6 py-20">
    <div className="text-center mb-12 animate-fade-in-up">
      <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-4">נגישות</span>
      <h1 className="font-extrabold text-4xl text-amber-950 mb-3">הצהרת נגישות</h1>
      <p className="text-stone-400 text-sm">עודכן לאחרונה: יוני 2026</p>
    </div>

    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 sm:p-10 space-y-8 leading-relaxed text-stone-600 animate-fade-in-up">
      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">1. מחויבותנו לנגישות</h2>
        <p>אתר "מגדנות בטעם של עוד" שואף לאפשר לכל משתמשי האתר, לרבות אנשים עם מוגבלויות, ליהנות משירות נגיש ושוויוני. אנו פועלים להנגשת האתר, במיטב המאמצים, על מנת להקל על השימוש בו וכן להפוך את השירותים שלנו לזמינים עבור אנשים עם מוגבלויות.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">2. תקני נגישות</h2>
        <p>האתר עומד בתקנות שוויון זכויות לאנשים עם מוגבלויות (התאמות נגישות לשירות), התשע"ג-2013. ההתאמות הנגישות בוצעו על פי ת"י 5568 לנגישות תכנים באינטרנט ברמת AA ובהתאם להנחיות WCAG 2.0.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">3. ההתאמות שבוצעו באתר</h2>
        <p>האתר הותאם כך שיתאפשר שימוש נוח וישיר עבור לקוחותינו לרבות באמצעות:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>ניווט מקלדת</strong> — האתר תומך בניווט באמצעות המקלדת. שימוש במקש TAB, אישור ע"י מקש Enter ויציאה מתפריטים/חלונות באמצעות מקש Esc.</li>
          <li><strong>מבנה תוכן</strong> — האתר בנוי בצורה ברורה ומאפשרת התמצאות מיטבית עבור טכנולוגיות מסייעות (קוראי מסך).</li>
          <li><strong>טפסים נגישים</strong> — טפסים מותאמים לקוראי מסך וכוללים חיווי טקסטואלי ברור במקרה של שגיאה.</li>
          <li><strong>תאימות</strong> — האתר מותאם לתצוגה בדפדפנים נפוצים ולשימוש במכשירים ניידים.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">4. תפריט הנגישות באתר</h2>
        <p>בפינה השמאלית התחתונה של האתר מופיע סמל נגישות (♿). לחיצה עליו פותחת תפריט המאפשר, בין היתר:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li>הגדלת גודל הטקסט (כולל מצב טקסט גדול במיוחד)</li>
          <li>מעבר לגופן קריא יותר</li>
          <li>הגדלת מרווחים בין שורות ואותיות</li>
          <li>הדגשת קישורים באתר</li>
          <li>מצבי ניגודיות שונים — ניגודיות גבוהה, ניגודיות הפוכה (כהה) וגווני אפור</li>
          <li>עצירת אנימציות ותנועה באתר</li>
          <li>סמן עכבר מוגדל</li>
          <li>איפוס כל ההגדרות בלחיצת כפתור אחת</li>
        </ul>
        <p className="mt-2">ההעדפות שתבחרו נשמרות בדפדפן שלכם לשימוש עתידי באתר.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">5. רכיבי צד שלישי</h2>
        <p>אנו עושים את מירב המאמצים להנגיש את כל הדפים באתר. עם זאת, ייתכן ויתכנו רכיבים חיצוניים (כגון מפות) שאין לנו שליטה טכנית על נגישותם. המידע המלא בדפים אלו זמין באתר ללא שימוש ברכיבים אלו.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">6. נגישות פיזית</h2>
        <p>בית העסק שלנו ממוקם ברחוב הרב חזני 1, נתיבות. ניתן לפנות אלינו מראש לתיאום ביקור והתאמת השירות הפיזי לצרכים מיוחדים.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">7. פניות ומשוב בנושא נגישות</h2>
        <p>אם נתקלתם בבעיה או קושי בנושא נגישות באתר, או שיש לכם הצעות לשיפור — נשמח לשמוע ולטפל בפנייתכם בהקדם. ניתן לפנות לממונה הנגישות מטעמנו, יולי:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-1">
          <li>דוא״ל ממונה הנגישות: <span dir="ltr" className="font-bold">accessibility@2269702.xyz</span></li>
          <li>דוא״ל כללי: <span dir="ltr" className="font-bold">info@2269702.xyz</span></li>
          <li>טלפון: <span dir="ltr">077-2269702</span></li>
          <li>שיחה נגישה באמצעים נוספים (טלפון/וואטסאפ): <span dir="ltr" className="font-bold">055-5615243</span></li>
          <li>כתובת: הרב חזני 1, נתיבות</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">8. עדכון ההצהרה</h2>
        <p>הצהרת נגישות זו תיבדק ותעודכן מעת לעת בהתאם לשינויים באתר ובדרישות הדין.</p>
      </section>
    </div>
  </div>
);
