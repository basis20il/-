import React, { useEffect, useState } from 'react';
import { supabase, Promotion, promotionImage } from '../lib/supabase';

const emptyForm = { id: '', title: '', description: '', link_url: '', sort_order: '0', image_url: '', image_base64: '' };

export const PromotionsAdmin: React.FC = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from('promotions').select('*').order('sort_order', { ascending: true });
    setPromos((data as Promotion[]) || []);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => { setForm(emptyForm); setEditing(false); };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image_base64: reader.result as string, image_url: '' }));
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        link_url: form.link_url || null,
        sort_order: parseInt(form.sort_order) || 0,
        image_url: form.image_url || null,
        image_base64: form.image_base64 || null,
      };
      if (editing && form.id) {
        const { error } = await supabase.from('promotions').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('promotions').insert(payload);
        if (error) throw error;
      }
      resetForm();
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const edit = (p: Promotion) => {
    setForm({
      id: p.id, title: p.title, description: p.description || '', link_url: p.link_url || '',
      sort_order: String(p.sort_order), image_url: p.image_url || '', image_base64: p.image_base64 || '',
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleActive = async (p: Promotion) => {
    await supabase.from('promotions').update({ is_active: !p.is_active }).eq('id', p.id);
    load();
  };

  const remove = async (p: Promotion) => {
    if (!confirm(`למחוק את המבצע "${p.title}"?`)) return;
    await supabase.from('promotions').delete().eq('id', p.id);
    load();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <form onSubmit={submit} className="lg:col-span-1 bg-white rounded-2xl border border-amber-100 shadow-sm p-6 space-y-4 h-fit animate-fade-in-up">
        <h2 className="font-bold text-lg text-amber-950">{editing ? 'עריכת מבצע' : 'הוספת מבצע / פרסום חדש'}</h2>
        {error && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-2.5">{error}</p>}
        <div>
          <label className="block text-sm font-bold text-amber-950 mb-1.5">כותרת</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
        <div>
          <label className="block text-sm font-bold text-amber-950 mb-1.5">תיאור</label>
          <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">קישור (לא חובה)</label>
            <input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} dir="ltr"
              className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">סדר הצגה</label>
            <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })}
              className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-amber-950 mb-1.5">קישור לתמונה (URL)</label>
          <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value, image_base64: '' })} dir="ltr"
            className="w-full border border-amber-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-bold text-amber-950 mb-1.5">או העלאת תמונה מהמחשב</label>
          <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])}
            className="w-full text-sm text-stone-500 file:ml-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-amber-100 file:text-amber-900 file:font-bold" />
        </div>
        {(form.image_url || form.image_base64) && (
          <img src={form.image_url || form.image_base64} alt="תצוגה מקדימה" className="w-full aspect-video object-cover rounded-xl border border-amber-100" />
        )}
        <div className="flex gap-3">
          <button disabled={saving} className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition-colors">
            {saving ? 'שומר...' : editing ? 'עדכון מבצע' : 'הוספת מבצע'}
          </button>
          {editing && <button type="button" onClick={resetForm} className="text-stone-500 font-bold px-4">ביטול</button>}
        </div>
      </form>

      <div className="lg:col-span-2 space-y-3">
        {promos.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-center gap-4 animate-fade-in-up">
            <div className="w-16 h-16 rounded-xl bg-amber-100 flex items-center justify-center overflow-hidden flex-shrink-0">
              {promotionImage(p) ? <img src={promotionImage(p)} alt={p.title} className="w-full h-full object-cover" /> : <span className="text-2xl">📣</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-950 truncate">{p.title}</p>
              <p className="text-sm text-stone-400 truncate">{p.description}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>{p.is_active ? 'פעיל' : 'מוסתר'}</span>
            <button onClick={() => toggleActive(p)} className="text-xs font-bold text-amber-700 hover:underline whitespace-nowrap">{p.is_active ? 'הסתר' : 'הצג'}</button>
            <button onClick={() => edit(p)} className="text-xs font-bold text-amber-700 hover:underline">עריכה</button>
            <button onClick={() => remove(p)} className="text-xs font-bold text-red-600 hover:underline">מחיקה</button>
          </div>
        ))}
        {promos.length === 0 && <p className="text-stone-400 text-center py-10">אין עדיין מבצעים. הוסיפו את הראשון!</p>}
      </div>
    </div>
  );
};
