import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("khaled_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem("khaled_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("khaled_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("khaled_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  // إضافة عنصر للسلة
  const addToCart = (item) => {
    setCart((prev) => {
      const exists = prev.find((i) => (i._id || i.id) === (item._id || item.id));
      if (exists) {
        return prev.map((i) =>
          (i._id || i.id) === (item._id || item.id)
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  // حذف عنصر من السلة
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => (i._id || i.id) !== id));
  };

  // تعديل الكمية
  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if ((i._id || i.id) === id) {
            const newQty = (i.quantity || 1) + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  // إفراغ السلة
  const clearCart = () => setCart([]);

  // إضافة / حذف من المفضلة
  const toggleWishlist = (item) => {
    setWishlist((prev) => {
      const exists = prev.some((i) => (i._id || i.id) === (item._id || item.id));
      if (exists) {
        return prev.filter((i) => (i._id || i.id) !== (item._id || item.id));
      }
      return [...prev, item];
    });
  };

  const isInWishlist = (id) => wishlist.some((i) => (i._id || i.id) === id);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);