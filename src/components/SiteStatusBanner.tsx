import React from 'react';
import { useSettings } from '../context/SettingsContext';

// When the admin marks the site as "closed", a clear banner is shown sitewide.
// Ordering itself is also blocked in the Cart while closed.
export const SiteStatusBanner: React.FC = () => {
  const { settings } = useSettings();
  if (!settings || settings.is_open) return null;

  return (
    <div className="bg-amber-900 text-amber-50 text-center text-sm font-medium px-4 py-2.5 animate-fade-in">
      🕒 {settings.closed_message || 'האתר סגור כעת לקבלת הזמנות. נחזור בקרוב!'}
    </div>
  );
};
