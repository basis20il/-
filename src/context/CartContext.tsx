import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, effectivePrice } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  add: (product: Product) => void;
  remove: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextValue>({
  lines: [],
  add: () => {},
  remove: () => {},
  setQuantity: () => {},
  clear: () => {},
  total: 0,
  count: 0,
});

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = 'migdanot_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const add = (product: Product) => {
    setLines(prev => {
      const existing = prev.find(l => l.product.id === product.id);
      if (existing) {
        return prev.map(l => l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const remove = (productId: string) => {
    setLines(prev => prev.filter(l => l.product.id !== productId));
  };

  const setQuantity = (productId: string, qty: number) => {
    if (qty <= 0) return remove(productId);
    setLines(prev => prev.map(l => l.product.id === productId ? { ...l, quantity: qty } : l));
  };

  const clear = () => setLines([]);

  const total = lines.reduce((sum, l) => sum + effectivePrice(l.product, profile) * l.quantity, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider value={{ lines, add, remove, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
};
