/** "450.00 $" أو "السعر عند الطلب" إذا لم يُحدد سعر */
export const formatPrice = (price?: number) =>
  Number(price) > 0 ? `${Number(price).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $` : 'السعر عند الطلب';
