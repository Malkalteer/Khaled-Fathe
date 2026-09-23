import React from "react";
import { useCart } from "../context/CartContext";

export const CartDrawer = () => {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, clearCart } = useCart();

  // ⚠️ ضع رقم الواتساب الخاص بالمهندس خالد بالصيغة الدولية بدون علامة +
  const PHONE_NUMBER = "+201143226557"; 

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    let message = "مرحباً مهندس خالد 👋\nأرغب في الاستفسار عن المنتجات التالية:\n\n";

    cart.forEach((item, index) => {
      const productRating = item.averageRating ? `• التقييم: ${Number(item.averageRating).toFixed(1)}/5\n` : '';
      const favoriteState = item.userFavorite ? '• هذا المنتج مفضل لدي ✅\n' : '';
      message += `🔹 *${index + 1}. ${item.title || item.name}*\n`;
      if (item.category) message += `   • التصنيف: ${item.category}\n`;
      if (productRating) message += productRating;
      if (favoriteState) message += favoriteState;
      message += `   • العدد/الكمية: ${item.quantity || 1}\n\n`;
    });

    message += "أرجو التواصل معي لمناقشة التفاصيل والأسعار، مع العلم أن بعض هذه المنتجات تم تقييمها ومفضلة لدي.\nشكراً لك!";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-800">
              <h2 className="text-xl font-bold">سلة الاستفسارات ({cart.length})</h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-gray-500 hover:text-red-500 transition"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="mt-4 max-h-[65vh] overflow-y-auto space-y-4 pr-1">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-12">السلة فارغة حالياً</p>
              ) : (
                cart.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <div key={itemId} className="flex items-center justify-between gap-3 border-b pb-3 dark:border-gray-800">
                      <img
                        src={item.image || item.imgUrl || item.img || "/placeholder.jpg"}
                        alt={item.title || item.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-1">{item.title || item.name}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(itemId, -1)}
                            className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold">{item.quantity || 1}</span>
                          <button
                            onClick={() => updateQuantity(itemId, 1)}
                            className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(itemId)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        حذف
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Actions */}
          {cart.length > 0 && (
            <div className="pt-4 border-t dark:border-gray-800 space-y-3">
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition"
              >
                💬 إرسال الطلب عبر الواتساب
              </button>
              <button
                onClick={clearCart}
                className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-200"
              >
                إفراغ السلة
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};