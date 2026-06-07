import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, Vendor, Product, productImage, effectivePrice } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const VendorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [vendor, setVendor] = useState<Vendor | null | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [added, setAdded] = useState<string | null>(null);
  const { profile } = useAuth();
  const { add } = useCart();

  useEffect(() => {
    if (!slug) return;
    supabase.from('vendors').select('*').eq('slug', slug).eq('status', 'approved').maybeSingle()
      .then(({ data }) => {
        setVendor((data as Vendor) || null);
        if (data) {
          supabase.from('products').select('*').eq('vendor_id', data.id).eq('is_active', true)
            .then(({ data: prods }) => setProducts((prods as Product[]) || []));
        }
      });
  }, [slug]);

  const handleAdd = (p: Product) => {
    add(p);
    setAdded(p.id);
    setTimeout(() => setAdded(null), 1500);
  };

  if (vendor === undefined) return <div className="max-w-5xl mx-auto px-6 py-24 text-center text-stone-400">טוען...</div>;
  if (vendor === null) return (
    <div className="max-w-xl mx-auto px-6 py-28 text-center">
      <p className="text-6xl mb-4">🏪</p>
      <h1 className="font-extrabold text-2xl text-amber-950 mb-3">העסק לא נמצא</h1>
      <Link to="/menu" className="text-amber-800 font-bold hover:underline">חזרה לתפריט ←</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-fade-in-up">
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-8 mb-10">
        <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold tracking-wide px-4 py-2 rounded-full mb-3">🏪 עסק שותף</span>
        <h1 className="font-extrabold text-3xl text-amber-950 mb-3">{vendor.name}</h1>
        {vendor.description && <p className="text-stone-600 leading-relaxed mb-4">{vendor.description}</p>}
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {vendor.kosher_info && <p><span className="font-bold text-amber-950">כשרות: </span><span className="text-stone-500">{vendor.kosher_info}</span></p>}
          {vendor.supply_method && <p><span className="font-bold text-amber-950">אספקה: </span><span className="text-stone-500">{vendor.supply_method}</span></p>}
          {vendor.area && <p><span className="font-bold text-amber-950">איזור: </span><span className="text-stone-500">{vendor.area}</span></p>}
        </div>
      </div>

      <h2 className="font-extrabold text-2xl text-amber-950 mb-6">המוצרים של {vendor.name}</h2>
      {products.length === 0 ? (
        <p className="text-stone-400 text-center py-10">אין כרגע מוצרים פעילים מעסק זה.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-amber-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="aspect-[4/3] bg-amber-100 flex items-center justify-center overflow-hidden">
                {productImage(p) ? <img src={productImage(p)} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-5xl">🧁</span>}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-amber-950">{p.name}</h3>
                  <span className="font-extrabold text-amber-800 whitespace-nowrap">₪{effectivePrice(p, profile).toFixed(2)}</span>
                </div>
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
