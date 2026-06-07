import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const STORAGE_KEY = 'migdanot_a11y_v1';

const TOGGLES: { key: string; label: string; icon: string; cls: string }[] = [
  { key: 'largerText', label: 'טקסט גדול יותר', icon: 'Tt', cls: 'a11y-larger-text' },
  { key: 'largestText', label: 'טקסט גדול מאוד', icon: 'TT', cls: 'a11y-largest-text' },
  { key: 'readableFont', label: 'גופן קריא', icon: 'Aa', cls: 'a11y-readable-font' },
  { key: 'lineHeight', label: 'ריווח שורות', icon: '☰', cls: 'a11y-line-height' },
  { key: 'letterSpacing', label: 'ריווח אותיות', icon: '↔', cls: 'a11y-letter-spacing' },
  { key: 'highlightLinks', label: 'הדגשת קישורים', icon: '🔗', cls: 'a11y-highlight-links' },
  { key: 'highlightHeadings', label: 'הדגשת כותרות', icon: 'H', cls: 'a11y-highlight-headings' },
  { key: 'largeTargets', label: 'הגדלת אזורי לחיצה', icon: '⬚', cls: 'a11y-large-targets' },
  { key: 'highContrast', label: 'ניגודיות גבוהה', icon: '◐', cls: 'a11y-high-contrast' },
  { key: 'darkContrast', label: 'ניגודיות הפוכה', icon: '🌙', cls: 'a11y-dark-contrast' },
  { key: 'grayscale', label: 'גווני אפור', icon: '⬜', cls: 'a11y-grayscale' },
  { key: 'pauseAnimations', label: 'עצירת אנימציות', icon: '⏸', cls: 'a11y-pause' },
  { key: 'bigCursor', label: 'סמן עכבר גדול', icon: '➤', cls: 'a11y-big-cursor' },
  { key: 'readingGuide', label: 'פס קריאה נע', icon: '➖', cls: '' },
  { key: 'textToSpeech', label: 'הקראה קולית', icon: '🔊', cls: 'a11y-tts' },
];

type Prefs = Record<string, boolean>;

const load = (): Prefs => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
};

export const AccessibilityWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    const root = document.documentElement;
    TOGGLES.forEach(t => { if (t.cls) root.classList.toggle(t.cls, !!prefs[t.key]); });
  }, [prefs]);

  useEffect(() => {
    if (!prefs.readingGuide) return;
    const bar = document.createElement('div');
    bar.className = 'a11y-reading-guide-bar';
    document.body.appendChild(bar);
    const onMove = (e: MouseEvent) => { bar.style.top = `${e.clientY}px`; };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); bar.remove(); };
  }, [prefs.readingGuide]);

  useEffect(() => {
    if (!prefs.textToSpeech) { window.speechSynthesis?.cancel(); return; }
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a, button, p, h1, h2, h3, li');
      if (!el || !el.textContent?.trim()) return;
      e.preventDefault();
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(el.textContent.trim());
      utter.lang = 'he-IL';
      window.speechSynthesis.speak(utter);
    };
    document.addEventListener('click', onClick, true);
    return () => { document.removeEventListener('click', onClick, true); window.speechSynthesis?.cancel(); };
  }, [prefs.textToSpeech]);

  const toggle = (key: string) => setPrefs(p => ({ ...p, [key]: !p[key] }));
  const reset = () => setPrefs({});

  return (
    <>
      <button onClick={() => setOpen(o => !o)} aria-label="תפריט נגישות"
        className="fixed bottom-6 left-6 z-[60] w-[4.5rem] h-[4.5rem] rounded-full bg-amber-800 hover:bg-amber-900 text-white shadow-xl flex items-center justify-center text-3xl transition-transform hover:scale-110">
        ♿
      </button>

      {open && (
        <div className="fixed bottom-28 left-6 z-[60] w-[22rem] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-10rem)] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-amber-100 animate-fade-in-up">
          <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-amber-100 z-10">
            <h3 className="font-bold text-amber-950">הגדרות נגישות</h3>
            <div className="flex items-center gap-2">
              <button onClick={reset} className="text-xs font-bold text-amber-700 hover:underline">איפוס</button>
              <button onClick={() => setOpen(false)} aria-label="סגירה" className="w-7 h-7 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">✕</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            {TOGGLES.map(t => (
              <button key={t.key} onClick={() => toggle(t.key)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-sm font-bold transition-colors ${prefs[t.key] ? 'bg-amber-100 border-amber-400 text-amber-900' : 'bg-white border-amber-200 text-stone-600 hover:bg-amber-50'}`}>
                <span className="text-xl">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
          <p className="px-5 pb-5 text-xs text-stone-400">
            <Link to="/accessibility" className="font-bold text-amber-800 hover:underline" onClick={() => setOpen(false)}>הצהרת נגישות מלאה ←</Link>
          </p>
        </div>
      )}
    </>
  );
};
