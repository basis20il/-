import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase, Product, productImage, effectivePrice, averageRating, locationMatchScore, haversineKm } from '../lib/supabase';

const NEARBY_RADIUS_KM = 20;

const geocode = async (place: string): Promise<{ lat: number; lon: number } | null> => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(place)}&countrycodes=il&limit=1&accept-language=he`);
    const data = await res.json();
    const hit = data?.[0];
    return hit ? { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) } : null;
  } catch {
    return null;
  }
};
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Menu: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'הכל');
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const { add } = useCart();
  const { profile, session } = useAuth();
  const [added, setAdded] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [nearbyAreas, setNearbyAreas] = useState<Set<string>>(new Set());
  const geocodeCache = useRef<Map<string, { lat: number; lon: number } | null>>(new Map());

  const detectLocation = () => {
    if (!navigator.geolocation) { setLocationError('הדפדפן אינו תומך באיתור מיקום.'); return; }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=he`);
        const data = await res.json();
        const place = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;
        if (place) setArea(place);
        else setLocationError('לא הצלחנו לזהות את שם האיזור. אפשר להקליד אותו ידנית.');
      } catch {
        setLocationError('איתור המיקום נכשל. אפשר להקליד את האיזור ידנית.');
      } finally {
        setLocating(false);
      }
    }, () => {
      setLocationError('לא ניתנה הרשאה לאיתור מיקום. אפשר להקליד את האיזור ידנית.');
      setLocating(false);
    });
  };

  const openReview = (p: Product) => {
    const mine = p.reviews?.find(r => r.user_id === session?.user.id);
    setReviewRating(mine?.rating || 5);
    setReviewComment(mine?.comment || '');
    setReviewing(reviewing === p.id ? null : p.id);
  };

  const submitReview = async (p: Product) => {
    if (!session) return;
    setSavingReview(true);
    const { error } = await supabase.from('reviews').upsert({
      product_id: p.id, user_id: session.user.id, rating: reviewRating, comment: reviewComment || null,
    }, { onConflict: 'product_id,user_id' });
    setSavingReview(false);
    if (!error) {
      const { data } = await supabase.from('products').select('*, vendor:vendors(*), reviews(*)').eq('is_active', true).order('created_at', { ascending: false });
      setProducts((data as Product[]) || []);
      setReviewing(null);
    }
  };

  useEffect(() => {
    supabase.from('products').select('*, vendor:vendors(*), reviews(*)').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data }) => { setProducts((data as Product[]) || []); setLoading(false); });
  }, []);

  useEffect(() => { if (profile?.address) setArea(profile.address); }, [profile?.address]);

  useEffect(() => { const c = searchParams.get('category'); if (c) setCategory(c); }, [searchParams]);

  const categories = useMemo(() => ['הכל', ...Array.from(new Set(products.map(p => p.category).filter(Boolean) as string[]))], [products]);

  const knownAreas = useMemo(() => Array.from(new Set(products.map(p => p.vendor?.area).filter(Boolean) as string[])), [products]);

  const areaSuggestions = useMemo(() => {
    const q = area.trim().toLowerCase();
    if (!q) return [];
    return knownAreas.filter(a => a.toLowerCase().includes(q) && a.toLowerCase() !== q).slice(0, 6);
  }, [knownAreas, area]);

  useEffect(() => {
    const q = area.trim();
    if (!q) { setNearbyAreas(new Set()); return; }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const cache = geocodeCache.current;
      const getCoords = async (place: string) => {
        const key = place.trim().toLowerCase();
        if (cache.has(key)) return cache.get(key)!;
        const coords = await geocode(place);
        cache.set(key, coords);
        return coords;
      };
      const origin = await getCoords(q);
      if (cancelled || !origin) { if (!cancelled) setNearbyAreas(new Set()); return; }
      const result = new Set<string>();
      for (const a of knownAreas) {
        if (cancelled) return;
        if (a.trim().toLowerCase() === q.toLowerCase()) continue;
        const coords = await getCoords(a);
        if (coords && haversineKm(origin, coords) <= NEARBY_RADIUS_KM) result.add(a);
      }
      if (!cancelled) setNearbyAreas(result);
    }, 600);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [area, knownAreas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = category === 'הכל' ? products : products.filter(p => p.category === category);
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q) ||
        (p.vendor?.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    if (area.trim()) {
      const score = (vendorArea: string | null | undefined) => {
        const textScore = locationMatchScore(vendorArea, area);
        const nearbyScore = vendorArea && nearbyAreas.has(vendorArea) ? 2.5 : 0;
        return Math.max(textScore, nearbyScore);
      };
      list = [...list].sort((a, b) => score(b.vendor?.area) - score(a.vendor?.area));
    }
    return list;
  }, [products, category, search, area, nearbyAreas]);

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

      <div className="max-w-2xl mx-auto grid sm:grid-cols-2 gap-3 mb-8 animate-fade-in-up">
        <div className="relative">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם מוצר, אופה, קונדיטוריה..."
            className="w-full border border-amber-200 rounded-full pr-11 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300">📍</span>
            <input value={area} onChange={e => { setArea(e.target.value); setShowAreaSuggestions(true); }}
              onFocus={() => setShowAreaSuggestions(true)} onBlur={() => setTimeout(() => setShowAreaSuggestions(false), 150)}
              placeholder="האיזור שלך (לדוגמה: נתיבות) — להצגת הקרובים אליך קודם" autoComplete="off"
              className="w-full border border-amber-200 rounded-full pr-11 pl-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <button type="button" onClick={detectLocation} disabled={locating} title="איתור המיקום שלי אוטומטית" aria-label="איתור מיקום אוטומטי"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-amber-100 hover:bg-amber-200 disabled:opacity-60 text-amber-800 flex items-center justify-center text-sm transition-colors">
              {locating ? '…' : '🎯'}
            </button>
            {showAreaSuggestions && areaSuggestions.length > 0 && (
              <ul className="absolute z-20 top-full mt-1.5 w-full bg-white border border-amber-200 rounded-2xl shadow-lg overflow-hidden">
                {areaSuggestions.map(s => (
                  <li key={s}>
                    <button type="button" onMouseDown={() => { setArea(s); setShowAreaSuggestions(false); }}
                      className="w-full text-right px-4 py-2 text-sm text-stone-600 hover:bg-amber-50 transition-colors">📍 {s}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {locationError && <p className="text-xs text-red-600 mt-1.5 px-2">{locationError}</p>}
          {!locationError && nearbyAreas.size > 0 && (
            <p className="text-xs text-amber-700 mt-1.5 px-2">מציגים גם איזורים קרובים (עד כ-{NEARBY_RADIUS_KM} ק"מ): {Array.from(nearbyAreas).join(', ')}</p>
          )}
        </div>
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
                <div className="flex items-center gap-2 mt-0.5">
                  {averageRating(p.reviews) != null ? (
                    <p className="text-xs text-amber-600">⭐ {averageRating(p.reviews)!.toFixed(1)} ({p.reviews!.length} ביקורות)</p>
                  ) : <p className="text-xs text-stone-300">אין עדיין דירוגים</p>}
                  {session && <button onClick={() => openReview(p)} className="text-xs font-bold text-amber-800 hover:underline">✍️ ביקורת</button>}
                </div>
                {reviewing === p.id && (
                  <div className="mt-2 bg-amber-50 rounded-xl p-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} type="button" onClick={() => setReviewRating(n)} className={`text-lg ${n <= reviewRating ? 'text-amber-500' : 'text-stone-300'}`}>★</button>
                      ))}
                    </div>
                    <textarea rows={2} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="ביקורת קצרה (לא חובה)"
                      className="w-full border border-amber-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none bg-white" />
                    <button onClick={() => submitReview(p)} disabled={savingReview}
                      className="text-sm font-bold bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white px-4 py-1.5 rounded-full transition-colors">
                      {savingReview ? 'שולח...' : 'שליחת ביקורת'}
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  {p.category && <span className="text-xs text-amber-600">{p.category}</span>}
                  {p.vendor && p.vendor.status === 'approved' && (
                    <Link to={`/vendor/${p.vendor.slug}`} onClick={e => e.stopPropagation()}
                      className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full px-2.5 py-0.5 hover:bg-amber-100 transition-colors">
                      🏪 {p.vendor.name}
                    </Link>
                  )}
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
