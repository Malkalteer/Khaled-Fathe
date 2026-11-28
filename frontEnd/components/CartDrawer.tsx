import React, { useEffect } from 'react';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { whatsappLink } from '../lib/whatsapp';
import { formatPrice } from '../lib/format';

export const CartDrawer: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, clearCart, total } = useCart();
  const hasUnpriced = cart.some((i) => !(Number(i.price) > 0));

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCartOpen, setIsCartOpen]);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;
    let message = 'مرحباً مهندس خالد 👋\nأرغب في شراء المنتجات التالية:\n\n';
    cart.forEach((item, index) => {
      message += `🔹 *${index + 1}. ${item.title}*\n`;
      if (item.code) message += `   • كود المنتج: ${item.code}\n`;
      if (item.category) message += `   • القسم: ${item.category}\n`;
      message += `   • الكمية: ${item.quantity}\n`;
      message += `   • السعر: ${formatPrice(item.price)}\n\n`;
    });
    if (total > 0) message += `💰 *الإجمالي: ${formatPrice(total)}*${hasUnpriced ? ' + منتجات سعرها عند الطلب' : ''}\n\n`;
    message += 'أرجو تأكيد الطلب وطريقة الدفع والتوصيل.\nشكراً لك!';
    window.open(whatsappLink(message), '_blank', 'noopener');
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="سلة المشتريات">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div className="w-screen max-w-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-6 shadow-2xl flex flex-col justify-between animate-fade-in">
          <div className="min-h-0 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-800">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart size={20} /> سلة المشتريات ({cart.length})
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-500 hover:text-red-500 transition" aria-label="إغلاق">
                <X size={20} />
              </button>
            </div>

            <div className="mt-4 max-h-[65vh] overflow-y-auto space-y-4 pl-1">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-12">السلة فارغة حالياً</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-3 border-b pb-3 dark:border-gray-800">
                    {item.image ? (
                      <img src={item.image} alt={item.title} loading="lazy" decoding="async" className="w-16 h-16 rounded-md object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-800" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                      <div className="text-xs font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                        {formatPrice(item.price)}
                        {item.code && <span className="mr-2 font-mono font-normal text-gray-400" dir="ltr">#{item.code}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item._id, -1)} aria-label="إنقاص" className="p-1 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700">
                          <Minus size={14} />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} aria-label="زيادة" className="p-1 bg-gray-200 dark:bg-gray-800 rounded hover:bg-gray-300 dark:hover:bg-gray-700">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 p-2" aria-label="حذف">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="pt-4 border-t dark:border-gray-800 space-y-3">
              <div className="flex items-center justify-between text-base font-bold">
                <span>الإجمالي</span>
                <span>{total > 0 ? formatPrice(total) : 'عند الطلب'}</span>
              </div>
              {hasUnpriced && total > 0 && <p className="text-xs text-gray-500">بعض المنتجات سعرها عند الطلب وسيُحدد عند التواصل.</p>}
              <button onClick={handleWhatsAppCheckout} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg transition">
                💬 إتمام الشراء عبر واتساب
              </button>
              <button onClick={clearCart} className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                إفراغ السلة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
