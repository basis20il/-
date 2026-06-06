import React from 'react';

export const About: React.FC = () => (
  <div className="max-w-5xl mx-auto px-6 py-20">
    <div className="text-center mb-14 animate-fade-in-up">
      <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-4">אודותינו</span>
      <h1 className="font-serif text-4xl sm:text-5xl font-bold text-amber-950 mb-6">הסיפור שלנו</h1>
    </div>

    <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
      <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-amber-100 to-rose-100 shadow-xl flex items-center justify-center text-9xl animate-float">👨‍🍳</div>
      <div className="space-y-5 text-stone-600 leading-loose animate-fade-in-up">
        <p><span className="font-bold text-amber-900">מגדנות בטעם של עוד</span> היא קונדיטוריה משפחתית הפועלת בלב העיר נתיבות, ומביאה אל השולחן שלכם עוגות, מאפים ומתוקים שנאפים מדי יום באהבה ובמסירות.</p>
        <p>אנו מאמינים שכל אירוע — קטן כגדול — ראוי למתיקות ברמה הגבוהה ביותר. לכן אנו מקפידים על חומרי גלם איכותיים, עבודת יד מדויקת ושירות אישי וחם, ומשרתים בגאווה גם את האישים והאירועים המכובדים ביותר.</p>
        <p>בין אם מדובר בעוגת יום הולדת אינטימית ובין אם באירוע ענק עם מאות מוזמנים — נשמח להפוך את החלום המתוק שלכם למציאות.</p>
      </div>
    </div>

    <div className="grid sm:grid-cols-3 gap-6 text-center">
      {[
        { icon: '❤️', title: 'באהבה ובמסירות', text: 'כל מוצר נאפה ביד מרכיבים טריים ואיכותיים' },
        { icon: '🏆', title: 'רמה גבוהה', text: 'שירות לאירועים ולקוחות מהשורה הראשונה' },
        { icon: '🤝', title: 'יחס אישי', text: 'אנחנו כאן בשבילכם מהרגע הראשון ועד לאחרון' },
      ].map(v => (
        <div key={v.title} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div className="text-4xl mb-3">{v.icon}</div>
          <h3 className="font-bold text-amber-950 mb-2">{v.title}</h3>
          <p className="text-sm text-stone-500">{v.text}</p>
        </div>
      ))}
    </div>
  </div>
);
