import React from 'react';

export const PrivacyPolicy: React.FC = () => (
  <div className="max-w-3xl mx-auto px-6 py-20">
    <div className="text-center mb-12 animate-fade-in-up">
      <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-4">פרטיות</span>
      <h1 className="font-extrabold text-4xl text-amber-950 mb-3">מדיניות פרטיות</h1>
      <p className="text-stone-400 text-sm">עודכן לאחרונה: יוני 2026</p>
    </div>

    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 sm:p-10 space-y-8 leading-relaxed text-stone-600 animate-fade-in-up">
      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">1. כללי</h2>
        <p>אתר "מגדנות בטעם של עוד" (להלן: "האתר") מופעל על ידי הקונדיטוריה "מגדנות בטעם של עוד" בנתיבות. אנו מכבדים את פרטיות המשתמשים באתר, ומסמך זה מסביר אילו מידע אנו אוספים, כיצד אנו משתמשים בו וכיצד ניתן לפנות אלינו בנושא.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">2. איזה מידע אנו אוספים</h2>
        <ul className="list-disc list-inside space-y-1.5">
          <li>פרטי הרשמה: שם מלא, כתובת דוא״ל ומספר טלפון.</li>
          <li>במקרה של התחברות דרך Google או Facebook — שם, כתובת דוא״ל ותמונת פרופיל כפי שמועברים אלינו מאותם שירותים, בכפוף להרשאה שתאשרו.</li>
          <li>פרטי הזמנות: מוצרים שנבחרו, הערות, תאריך איסוף/אספקה וסכום ההזמנה.</li>
          <li>פניות שנשלחות דרך טופס "צור קשר" (שם, טלפון ותוכן ההודעה).</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">3. כיצד אנו משתמשים במידע</h2>
        <ul className="list-disc list-inside space-y-1.5">
          <li>לניהול חשבון המשתמש שלכם באתר ואימות זהות בעת התחברות.</li>
          <li>לטיפול בהזמנות, הפקת חשבוניות ויצירת קשר לתיאום אספקה/איסוף.</li>
          <li>למענה על פניות שהתקבלו דרך טופס יצירת הקשר.</li>
          <li>לשיפור השירות והתאמתו לצרכי הלקוחות.</li>
        </ul>
        <p className="mt-2">לא נמכור, נשכיר או נעביר את פרטיכם האישיים לצדדים שלישיים למטרות שיווק, למעט ככל שנדרש לצורך אספקת השירות עצמו (למשל שירותי תשתית כגון Supabase לאחסון נתונים).</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">4. אבטחת מידע</h2>
        <p>הסיסמאות שלכם אינן נשמרות כטקסט גלוי — הן מנוהלות ומוצפנות באמצעות מערכת האימות של Supabase, על פי תקני אבטחה מקובלים. הגישה למידע האישי שלכם מוגבלת באמצעות מנגנוני הרשאות (RLS) כך שכל משתמש יכול לצפות אך ורק במידע ובהזמנות השייכים לו, ולא במידע של משתמשים אחרים.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">5. כניסה דרך Google / Facebook</h2>
        <p>אם תבחרו להתחבר באמצעות חשבון Google או Facebook, אנו מקבלים מאותם שירותים רק את המידע הבסיסי הדרוש ליצירת חשבון (שם, דוא״ל ותמונת פרופיל), ובכפוף להרשאות שתאשרו מול אותו שירות. אנו לא מקבלים גישה לסיסמתכם בחשבון Google/Facebook ולא מפרסמים בשמכם.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">6. עוגיות (Cookies) ואחסון מקומי — מדיניות מפורטת</h2>
        <p>בכניסה הראשונה לאתר תוצג בקשת הסכמה לעוגיות, ותוכלו לבחור לאשר הכל, לדחות הכל, או להתאים אישית את ההעדפות לפי הקטגוריות הבאות. ניתן לשנות העדפות בכל עת על ידי מחיקת נתוני האתר בדפדפן — בקשת ההסכמה תוצג מחדש.</p>
        <ul className="list-disc list-inside space-y-1.5 mt-2">
          <li><strong>עוגיות הכרחיות (תמיד פעילות):</strong> נדרשות לתפעול בסיסי של האתר — ניהול הפעלת ההתחברות (Auth), שמירת תוכן עגלת הקניות שלכם ב-Local Storage, ואבטחת האתר. ללא עוגיות אלו האתר לא יוכל לפעול כראוי, ולכן אינן ניתנות לכיבוי.</li>
          <li><strong>עוגיות אנליטיקה ומעקב גלישה:</strong> ייטענו רק אם תאשרו זאת מפורשות. בקטגוריה זו נעשה שימוש בכלים הבאים, המתעדים נתוני גלישה כגון עמודים שנצפו, זמן שהייה, מיקום גאוגרפי כללי וסוג מכשיר/דפדפן: <strong>Google Analytics (GA4)</strong>, <strong>Google Tag Manager</strong>, <strong>Microsoft Clarity</strong> (כולל הקלטות מסך אנונימיות של גלישה), <strong>ContentSquare</strong> ו-<strong>Cloudflare Web Analytics</strong>. הנתונים הנאספים משמשים אותנו להבנת אופן השימוש באתר ולשיפורו, ועשויים להיות מועברים לשרתי הספקים הללו בהתאם למדיניות הפרטיות שלהם. אינן פעילות כברירת מחדל.</li>
          <li><strong>עוגיות שיווק:</strong> ייטענו רק אם תאשרו זאת מפורשות, ועשויות לשמש להתאמת תוכן ופרסום רלוונטי. אינן פעילות כברירת מחדל.</li>
        </ul>
        <p className="mt-2">אנו פועלים לפי עיקרון "הסכמה מדעת מראש" (Opt-in): כל עוגייה שאינה הכרחית לתפעול האתר תיטען רק לאחר קבלת הסכמתכם המפורשת, בהתאם לדרישות הדין החל.</p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">7. זכותכם לעיין, לתקן ולמחוק מידע</h2>
        <p>תוכלו בכל עת לצפות בפרטי החשבון שלכם ולעדכן אותם דרך עמוד "החשבון שלי" באתר. אם ברצונכם למחוק לחלוטין את כל המידע האישי השמור אצלנו — לרבות במקרה של הרשמה דרך Google או Facebook — ניתן לפנות אלינו בעמוד הייעודי:</p>
        <p className="mt-2"><a href="/data-deletion" className="font-bold text-amber-800 hover:underline">לחצו כאן לבקשת מחיקת מידע אישי ←</a></p>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">8. יצירת קשר</h2>
        <p>בכל שאלה או בקשה הנוגעת למדיניות פרטיות זו, ניתן לפנות אלינו:</p>
        <ul className="list-disc list-inside space-y-1.5 mt-1">
          <li>דוא״ל: <span dir="ltr" className="font-bold">info@2269702.xyz</span></li>
          <li>טלפון: <span dir="ltr">077-2269702</span></li>
          <li>כתובת: הרב חזני 1, נתיבות</li>
        </ul>
      </section>

      <section>
        <h2 className="font-bold text-lg text-amber-950 mb-2">9. שינויים במדיניות זו</h2>
        <p>אנו עשויים לעדכן מעת לעת את מדיניות הפרטיות. שינויים מהותיים יפורסמו בעמוד זה, ותאריך העדכון האחרון יעודכן בהתאם.</p>
      </section>
    </div>
  </div>
);
