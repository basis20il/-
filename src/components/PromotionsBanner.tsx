import React, { useEffect, useState } from 'react';
import { supabase, Promotion, promotionImage } from '../lib/supabase';

export const PromotionsBanner: React.FC = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    supabase.from('promotions').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      .then(({ data }) => setPromos((data as Promotion[]) || []));
  }, []);

  useEffect(() => {
    if (promos.length < 2) return;
    const t = setInterval(() => setActive(a => (a + 1) % promos.length), 6000);
    return () => clearInterval(t);
  }, [promos]);

  if (promos.length === 0) return null;

  const Wrapper: React.FC<{ promo: Promotion; children: React.ReactNode }> = ({ promo, children }) =>
    promo.link_url ? <a href={promo.link_url} className="block">{children}</a> : <div>{children}</div>;

  return (
    <section className="max-w-7xl mx-auto px-6 pt-10 animate-fade-in-up">
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-100">
        {promos.map((promo, i) => (
          <div key={promo.id} className={`transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
            <Wrapper promo={promo}>
              <div className="relative bg-gradient-to-l from-amber-800 to-amber-950 text-white flex flex-col sm:flex-row items-center gap-6 p-8 sm:p-10 min-h-[200px]">
                {promotionImage(promo) && (
                  <img src={promotionImage(promo)} alt={promo.title} className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-2xl shadow-lg flex-shrink-0" />
                )}
                <div>
                  <span className="inline-block bg-white/20 text-xs font-bold tracking-wide px-3 py-1.5 rounded-full mb-3">מבצע</span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold mb-2">{promo.title}</h3>
                  {promo.description && <p className="text-amber-100/90 leading-relaxed max-w-xl">{promo.description}</p>}
                </div>
              </div>
            </Wrapper>
          </div>
        ))}
        {promos.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {promos.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} aria-label={`מבצע ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === active ? 'bg-white w-6' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
