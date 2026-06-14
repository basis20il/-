import React, { useEffect, useRef, useState } from 'react';

// Curated emoji set, grouped — relevant to a bakery/marketplace plus general-purpose icons.
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'מאפים ומתוקים', emojis: ['🎂','🧁','🍰','🥧','🍪','🍩','🍫','🍬','🍭','🍮','🍯','🥐','🥖','🍞','🥯','🥨','🧇','🥞','🍦','🍨'] },
  { label: 'פירות וטרי', emojis: ['🍓','🍒','🍑','🍎','🍏','🍐','🍊','🍋','🍌','🍉','🍇','🫐','🥝','🍍','🥭','🥥','🥑','🍅','🥕','🌽'] },
  { label: 'אוכל ושתייה', emojis: ['🥗','🧀','🥪','🌮','🍕','🍔','🍟','🍣','🍱','🥘','🍲','☕','🍵','🧋','🥤','🍷','🥂','🍾','🧃','🍶'] },
  { label: 'אירועים וכללי', emojis: ['🎉','🎊','🎁','🎀','💐','🌸','🌹','💍','👑','⭐','✨','💎','❤️','🔥','🏪','🛍️','📣','🕯️','🎈','🥳'] },
];

interface EmojiPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange, placeholder = '😀', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div className="flex">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={4}
          className={`w-full border border-amber-200 rounded-r-xl border-l-0 px-3 py-2 text-center text-lg focus:outline-none focus:ring-2 focus:ring-amber-400 ${className}`} />
        <button type="button" onClick={() => setOpen(o => !o)} aria-label="בחירת אימוג'י"
          className="border border-amber-200 rounded-l-xl px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors flex-shrink-0">
          😀
        </button>
      </div>
      {open && (
        <div className="absolute z-30 top-full mt-2 right-0 w-72 max-h-72 overflow-y-auto bg-white border border-amber-200 rounded-2xl shadow-xl p-3 animate-fade-in">
          {value && (
            <button type="button" onClick={() => { onChange(''); }}
              className="w-full text-xs text-stone-400 hover:text-red-600 mb-2 text-right">הסרת האימוג'י ✕</button>
          )}
          {EMOJI_GROUPS.map(g => (
            <div key={g.label} className="mb-2">
              <p className="text-[11px] font-bold text-amber-700/70 mb-1">{g.label}</p>
              <div className="grid grid-cols-8 gap-1">
                {g.emojis.map(em => (
                  <button key={em} type="button" onClick={() => { onChange(em); setOpen(false); }}
                    className={`text-xl rounded-lg p-1 hover:bg-amber-100 transition-colors ${value === em ? 'bg-amber-100 ring-2 ring-amber-400' : ''}`}>
                    {em}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[10px] text-stone-400 mt-1 text-center">אפשר גם להדביק אימוג'י ישירות בתיבה</p>
        </div>
      )}
    </div>
  );
};
