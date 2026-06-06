import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
          options: { data: { full_name: fullName, phone } },
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
