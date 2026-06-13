import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Product, productImage, effectivePrice, Category, categoryImage } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { PromotionsBanner } from '../components/PromotionsBanner';
import { useCart } from '../context/CartContext';

const features = [
  { icon: '🎂', title: 'עוגות מעוצבות', text: 'עוגות לאירועים, ימי הולדת ושמחות — בעיצוב אישי ומדויק.' },
  { icon: '🥐', title: 'מאפים טריים יומיום', text: 'נאפה מדי יום באהבה ובחומרי גלם איכותיים בלבד.' },
  { icon: '🍫', title: 'פרלינים ומתוקים', text: 'מבחר שוקולדים, פרלינים וקינוחים ברמת שף.' },
  { icon: '🚚', title: 'משלוחים והזמנות', text: 'הזמינו אונליין וקבלו עד הבית או איסוף עצמי מהקונדיטוריה.' },
];

export const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [added, setAdded] = useState<string | null>(null);
  const { add } = useCart();
  const { profile } = useAuth();
  const { settings } = useSettings();

  const handleAdd = (p: Product) => {
    add(p);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setProducts((data as Product[]) || []));
    supabase.from('categories').select('*').eq('is_featured', true).order('sort_order', { ascending: true })
      .then(({ data }) => setCategories((data as Category[]) || []));
  }, []);

  const heroBadge = settings?.hero_badge || 'קונדיטוריה משפחתית בנתיבות מאז ומתמיד';
  const heroTitle = settings?.hero_title || 'מגדנות\nבטעם של עוד';
  const heroSubtitle = settings?.hero_subtitle || 'בטעם של עוד';
  const heroText = settings?.hero_text ||
    'כל יצירה שיוצאת מהמטבח שלנו נאפית ביד, באהבה ובדייקנות — לאירועים המכובדים ביותר ולרגעים הקטנים שבכל יום. בואו לטעום את ההבדל.';
  const [titleLine1, titleLine2] = heroTitle.includes('\n') ? heroTitle.split('\n') : [heroTitle, heroSubtitle];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50 via-white to-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-40 -right-32 w-[28rem] h-[28rem] bg-rose-100/50 rounded-full blur-3xl animate-float-slower" />

        <div className="relative max-w-7xl mx-auto px-6 pt-8 sm:pt-10 lg:pt-14 pb-16 sm:pb-20 lg:pb-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in-up">
            <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-6">{heroBadge}</span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-amber-950 leading-[1.1] mb-6">
              {titleLine1}<br/><span className="text-amber-700">{titleLine2}</span>
            </h1>
            <p className="text-lg text-stone-600 max-w-xl leading-relaxed mb-10 whitespace-pre-line">
              {heroText}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="bg-amber-800 hover:bg-amber-900 text-white font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                להזמנה מהתפריט
              </Link>
              <Link to="/contact" className="bg-white border-2 border-amber-800 text-amber-900 font-bold px-8 py-4 rounded-full hover:bg-amber-50 transition-all duration-300 hover:-translate-y-1">
                צרו איתנו קשר
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-in-up [animation-delay:200ms] max-w-md mx-auto lg:max-w-none w-full">
            <div className="aspect-[5/4] rounded-[3rem] bg-gradient-to-br from-amber-200 via-amber-100 to-rose-100 shadow-2xl flex items-center justify-center text-[8rem] sm:text-[10rem] animate-float">
              🍰
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl px-6 py-4 animate-fade-in-up [animation-delay:500ms]">
              <p className="font-extrabold text-2xl text-amber-900">100%</p>
              <p className="text-xs text-stone-500">חומרי גלם איכותיים</p>
            </div>
          </div>
        </div>
      </section>

      <PromotionsBanner />

      {/* Smart category showcase */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-4">
          <div className="text-center mb-10 animate-fade-in-up">
            <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-3">הקטגוריות שלנו</span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-amber-950">מה מתחשק לכם היום?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((c, i) => (
              <Link key={c.id} to={`/menu?category=${encodeURIComponent(c.name)}`}
                className="group relative aspect-square rounded-3xl overflow-hidden shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up bg-gradient-to-br from-amber-100 via-amber-50 to-rose-50"
                style={{ animationDelay: `${i * 70}ms` }}>
                {categoryImage(c) && (
                  <img src={categoryImage(c)} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 text-center p-3 ${categoryImage(c) ? 'bg-gradient-to-t from-amber-950/70 via-amber-900/20 to-transparent' : ''}`}>
                  {!categoryImage(c) && <span className="text-5xl drop-shadow-sm">{c.icon || '🧁'}</span>}
                  <span className={`font-extrabold text-lg ${categoryImage(c) ? 'text-white drop-shadow mt-auto' : 'text-amber-950'}`}>
                    {categoryImage(c) && c.icon ? `${c.icon} ` : ''}{c.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={f.title} className="bg-white rounded-2xl border border-amber-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg text-amber-950 mb-2">{f.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About the service (for users & verification) */}
      <section className="max-w-4xl mx-auto px-6 py-14 text-center animate-fade-in-up">
        <h2 className="font-extrabold text-2xl sm:text-3xl text-amber-950 mb-4">מה השירות שלנו</h2>
        <p className="text-stone-600 leading-relaxed whitespace-pre-line">
          {settings?.about_text ||
            '"מגדנות בטעם של עוד" היא פלטפורמה דיגיטלית להזמנת מאפים, עוגות וקייטרינג מקונדיטוריות שותפות באזור נתיבות והסביבה.\nבאתר ניתן לעיין בתפריט, להזמין ולשלם, לעקוב אחר סטטוס ההזמנות ולנהל את הפרופיל האישי וההיסטוריה שלכם.\nהתחברות עם חשבון Google משמשת ליצירת חשבון משתמש מאובטח, ומאפשרת לכם לשמור פרטי קשר, לעקוב אחר הזמנות קודמות ולנהל את התוכן וההגדרות שלכם במערכת.'}
        </p>
      </section>

      {/* Featured products */}
      {products.length > 0 && (
        <section className="bg-amber-50/60 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-extrabold text-3xl sm:text-4xl text-amber-950">המומלצים שלנו</h2>
              <Link to="/menu" className="text-amber-800 font-bold hover:underline">לכל התפריט ←</Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p, i) => (
                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="aspect-[4/3] bg-amber-100 flex items-center justify-center overflow-hidden">
                    {productImage(p) ? <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /> : <span className="text-5xl">🧁</span>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-amber-950">{p.name}</h3>
                    <p className="text-sm text-stone-400 mt-1 line-clamp-2">{p.description}</p>
                    <p className="font-extrabold text-amber-800 mt-3">₪{effectivePrice(p, profile).toFixed(2)}</p>
                    <button onClick={() => handleAdd(p)}
                      className={`mt-3 w-full font-bold py-2 rounded-full text-sm transition-all duration-300 ${added === p.id ? 'bg-green-600 text-white' : 'bg-amber-800 hover:bg-amber-900 text-white hover:-translate-y-0.5'}`}>
                      {added === p.id ? 'נוסף לעגלה ✓' : 'הוספה לעגלה'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="font-extrabold text-3xl sm:text-4xl text-amber-950 mb-4">מתכננים אירוע מיוחד?</h2>
        <p className="text-stone-600 max-w-2xl mx-auto mb-8 leading-relaxed">אנחנו מתמחים בעוגות ומגשי מתוקים לאירועים מכובדים — חתונות, בר/בת מצווה, כנסים עסקיים ועוד. ספרו לנו מה אתם צריכים ונתאים לכם בדיוק את מה שמתאים.</p>
        <Link to="/contact" className="inline-block bg-amber-800 hover:bg-amber-900 text-white font-bold px-10 py-4 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1">דברו איתנו</Link>
      </section>
    </div>
  );
};
