import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, phone, address: address || null } },
        });
        if (error) throw error;
        setInfo('נרשמת בהצלחה! אם נדרש אימות מייל — בדקו את תיבת הדואר שלכם.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'אימייל או סיסמה שגויים' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white rounded-3xl border border-amber-100 shadow-xl p-8 animate-fade-in-up">
        <div className="text-center mb-8">
          <span className="text-4xl">🥐</span>
          <h1 className="font-serif text-2xl font-bold text-amber-950 mt-2">{mode === 'login' ? 'התחברות לחשבון' : 'הרשמה לאתר'}</h1>
          <p className="text-stone-400 text-sm mt-1">בטעם של עוד — קונדיטוריה בנתיבות</p>
        </div>

        <div className="flex bg-amber-50 rounded-full p-1 mb-6">
          <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200 ${mode === 'login' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>התחברות</button>
          <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-full text-sm font-bold transition-all duration-200 ${mode === 'register' ? 'bg-white shadow text-amber-900' : 'text-amber-700/60'}`}>הרשמה</button>
        </div>

        {error && <p className="bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</p>}
        {info && <p className="bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3 mb-4">{info}</p>}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button type="button" onClick={() => signInWithProvider('google')}
            className="flex items-center justify-center gap-2 border border-amber-200 rounded-xl py-2.5 font-bold text-sm text-stone-700 hover:bg-amber-50 transition-colors duration-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.86c2.26-2.09 3.56-5.17 3.56-8.87z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3a7.4 7.4 0 0 1-11-3.9H1.13v3.09A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.07 14.19a7.2 7.2 0 0 1 0-4.38V6.72H1.13a12 12 0 0 0 0 10.56l3.94-3.09z"/><path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.13 6.72l3.94 3.09A7.18 7.18 0 0 1 12 4.77z"/></svg>
            Google
          </button>
          <button type="button" onClick={() => signInWithProvider('facebook')}
            className="flex items-center justify-center gap-2 border border-amber-200 rounded-xl py-2.5 font-bold text-sm text-stone-700 hover:bg-amber-50 transition-colors duration-200">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
            Facebook
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="flex-1 h-px bg-amber-100" />
          <span className="text-xs text-stone-400">או עם אימייל וסיסמה</span>
          <span className="flex-1 h-px bg-amber-100" />
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">שם מלא</label>
                <input required value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">טלפון</label>
                <input required value={phone} onChange={e => setPhone(e.target.value)} dir="ltr"
                  className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow" />
              </div>
              <div>
                <label className="block text-sm font-bold text-amber-950 mb-1.5">כתובת <span className="font-normal text-stone-400">(לא חובה)</span></label>
                <input value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">אימייל</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} dir="ltr"
              className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow" />
          </div>
          <div>
            <label className="block text-sm font-bold text-amber-950 mb-1.5">סיסמה</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} dir="ltr"
              className="w-full border border-amber-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-shadow" />
          </div>
          <button disabled={loading} className="w-full bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white font-bold py-3 rounded-xl shadow transition-all duration-300 hover:-translate-y-0.5">
            {loading ? 'רגע...' : mode === 'login' ? 'התחברות' : 'הרשמה'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          <Link to="/" className="hover:text-amber-700">חזרה לדף הבית ←</Link>
        </p>
      </div>
    </div>
  );
};
