import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const links = [
  { to: '/', label: 'בית' },
  { to: '/menu', label: 'התפריט שלנו' },
  { to: '/about', label: 'אודות' },
  { to: '/contact', label: 'צור קשר' },
];

export const Navbar: React.FC = () => {
  const { session, profile, signOut } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white text-xl font-bold shadow-md group-hover:scale-105 transition-transform duration-300 font-serif">מ</span>
          <div className="leading-tight">
            <p className="text-xl text-amber-900 font-extrabold">בטעם של עוד</p>
            <p className="text-xs text-amber-700/70 tracking-wide">קונדיטוריה • נתיבות</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `relative font-medium text-sm transition-colors duration-200 hover:text-amber-800 ${isActive ? 'text-amber-900' : 'text-stone-600'} after:content-[''] after:absolute after:-bottom-2 after:right-0 after:h-0.5 after:bg-amber-700 after:transition-all after:duration-300 ${isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative p-2 rounded-full hover:bg-amber-50 transition-colors duration-200" aria-label="עגלת קניות">
            <svg className="w-6 h-6 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -left-1 bg-amber-700 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-fade-in">{count}</span>
            )}
          </Link>

          {session ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/account" className="text-sm font-medium text-stone-600 hover:text-amber-800 px-3 py-2 transition-colors">
                {profile?.full_name || 'החשבון שלי'}
              </Link>
              {profile?.is_admin && (
                <Link to="/admin" className="text-sm font-bold text-white bg-amber-900 hover:bg-amber-800 px-4 py-2 rounded-full transition-colors duration-200">ניהול</Link>
              )}
              <button onClick={handleSignOut} className="text-sm font-medium text-stone-500 hover:text-red-700 px-3 py-2 transition-colors">התנתקות</button>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:inline-block text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 px-5 py-2.5 rounded-full shadow transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
              התחברות / הרשמה
            </Link>
          )}

          <button className="md:hidden p-2" onClick={() => setOpen(o => !o)} aria-label="תפריט">
            <svg className="w-6 h-6 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t border-amber-100 bg-white px-4 py-4 flex flex-col gap-3 animate-fade-in">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-stone-700 font-medium py-1">{l.label}</NavLink>
          ))}
          {session ? (
            <>
              <Link to="/account" onClick={() => setOpen(false)} className="text-stone-700 font-medium py-1">{profile?.full_name || 'החשבון שלי'}</Link>
              {profile?.is_admin && <Link to="/admin" onClick={() => setOpen(false)} className="font-bold text-amber-900 py-1">ניהול</Link>}
              <button onClick={() => { setOpen(false); handleSignOut(); }} className="text-right text-red-700 font-medium py-1">התנתקות</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)} className="font-bold text-amber-900 py-1">התחברות / הרשמה</Link>
          )}
        </div>
      )}
    </header>
  );
};
