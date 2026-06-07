import React, { useEffect, useMemo, useState } from 'react';
import { supabase, Product, productImage, effectivePrice } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Menu: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('הכל');
  const { add } = useCart();
  const { profile } = useAuth();
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setProducts((data as Product[]) || []); setLoading(false); });
  }, []);

  const categories = useMemo(() => ['הכל', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))], [products]);
  const filtered = category === 'הכל' ? products : products.filter(p => p.category === category);

  const handleAdd = (p: Product) => {
    add(p);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12 animate-fade-in-up">
        <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-4">התפריט שלנו</span>
        <h1 className="font-extrabold text-4xl sm:text-5xl text-amber-950 mb-4">כל המתוקים שלנו במקום אחד</h1>
        <p className="text-stone-500 max-w-xl mx-auto">בחרו את המוצרים האהובים עליכם והוסיפו לעגלה — נטפל בהזמנה במהירות ובדייקנות.</p>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${category === c ? 'bg-amber-800 text-white shadow' : 'bg-amber-50 text-amber-900 hover:bg-amber-100'}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-center text-stone-400 py-20">טוען מוצרים...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🍰</p>
          <p className="text-stone-500">בקרוב יתווספו כאן מוצרים. עקבו אחרינו!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {filtered.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up flex flex-col" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="aspect-[4/3] bg-amber-100 flex items-center justify-center overflow-hidden">
                {productImage(p) ? <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /> : <span className="text-5xl">🧁</span>}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-amber-950">{p.name}</h3>
                  <span className="font-extrabold text-amber-800 whitespace-nowrap">₪{effectivePrice(p, profile).toFixed(2)}</span>
                </div>
                {p.category && <span className="text-xs text-amber-600 mt-1">{p.category}</span>}
                <p className="text-sm text-stone-400 mt-2 leading-relaxed flex-1">{p.description}</p>
                <button onClick={() => handleAdd(p)}
                  className={`mt-4 w-full font-bold py-2.5 rounded-full transition-all duration-300 ${added === p.id ? 'bg-green-600 text-white' : 'bg-amber-800 hover:bg-amber-900 text-white hover:-translate-y-0.5'}`}>
                  {added === p.id ? 'נוסף לעגלה ✓' : 'הוספה לעגלה'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
