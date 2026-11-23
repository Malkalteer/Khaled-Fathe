import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  _id: string;
  title: string;
  image: string;
  category?: string;
  averageRating?: number;
  userFavorite?: boolean;
  quantity: number;
}

interface CartContextValue {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const STORAGE_KEY = 'khaled_cart';
const CartContext = createContext<CartContextValue | null>(null);

const readCart = (): CartItem[] => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    // دعم الصيغة القديمة (id / name / imgUrl)
    return Array.isArray(saved)
      ? saved
          .map((i: any) => ({
            _id: i._id || i.id,
            title: i.title || i.name || '',
            image: i.image || i.imgUrl || i.img || '',
            category: typeof i.category === 'string' ? i.category : undefined,
            averageRating: i.averageRating,
            userFavorite: i.userFavorite,
            quantity: Math.max(1, Number(i.quantity) || 1),
          }))
          .filter((i: CartItem) => i._id)
      : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) return prev.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((id: string) => setCart((prev) => prev.filter((i) => i._id !== id)), []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i._id !== id) return [i];
        const quantity = i.quantity + delta;
        return quantity > 0 ? [{ ...i, quantity }] : [];
      })
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
