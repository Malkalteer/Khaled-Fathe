import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useToast } from '../components/ui/Toast';

export interface CartItem {
  _id: string;
  title: string;
  image: string;
  category?: string;
  price?: number;
  averageRating?: number;
  userFavorite?: boolean;
  quantity: number;
}

interface CartContextValue {
  cart: CartItem[];
  /** open=true: يفتح السلة مباشرة (زر «شراء»)، وإلا تظهر رسالة صغيرة فقط */
  addToCart: (item: Omit<CartItem, 'quantity'>, options?: { open?: boolean }) => void;
  total: number;
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
            price: Number(i.price) || 0,
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
  const toast = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, options: { open?: boolean } = {}) => {
    setCart((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      // في الشراء المباشر لا نزيد الكمية إذا كان المنتج موجوداً أصلاً في السلة
      if (exists) return options.open ? prev : prev.map((i) => (i._id === item._id ? { ...i, quantity: i.quantity + 1, price: item.price ?? i.price } : i));
      return [...prev, { ...item, quantity: 1 }];
    });
    if (options.open) setIsCartOpen(true);
    else toast.success(`أُضيف «${item.title}» إلى السلة`);
  }, [toast]);

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

  const total = useMemo(() => cart.reduce((sum, i) => sum + (Number(i.price) || 0) * i.quantity, 0), [cart]);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, total }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
