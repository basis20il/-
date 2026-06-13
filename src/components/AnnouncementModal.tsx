import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';

// A popup announcement the admin can enable/edit from the control panel.
// It is dismissed per-content: changing the title/body re-shows it once.
export const AnnouncementModal: React.FC = () => {
  const { settings } = useSettings();
  const [show, setShow] = useState(false);

  const active = !!settings?.announce_enabled && !!(settings?.announce_title || settings?.announce_body);
  const signature = active ? `${settings?.announce_title || ''}|${settings?.announce_body || ''}` : '';

  useEffect(() => {
    if (!active) { setShow(false); return; }
    const dismissed = localStorage.getItem('announce_dismissed');
    setShow(dismissed !== signature);
  }, [active, signature]);

  if (!active || !show) return null;

  const dismiss = () => {
    localStorage.setItem('announce_dismissed', signature);
    setShow(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-fade-in" onClick={dismiss}>
      <div onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-fade-in-up border border-amber-100">
        <button onClick={dismiss} aria-label="סגירה"
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center transition-colors">✕</button>
        <div className="text-6xl mb-4">{settings?.announce_emoji || '📣'}</div>
        {settings?.announce_title && <h2 className="font-extrabold text-2xl text-amber-950 mb-3">{settings.announce_title}</h2>}
        {settings?.announce_body && <p className="text-stone-600 leading-relaxed whitespace-pre-line">{settings.announce_body}</p>}
        {settings?.announce_link && (
          <a href={settings.announce_link} target="_blank" rel="noopener noreferrer"
            className="inline-block mt-6 bg-amber-800 hover:bg-amber-900 text-white font-bold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            פרטים נוספים
          </a>
        )}
      </div>
    </div>
  );
};
