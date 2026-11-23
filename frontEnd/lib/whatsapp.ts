import { SITE_URL, WHATSAPP_NUMBER } from './config';

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const productUrl = (id: string) => `${SITE_URL}/project/${id}`;

/** رسالة "اطلب عرض سعر" لمنتج: الاسم والصورة والرابط */
export const quoteMessageForProduct = (product: {
  _id: string;
  title: string;
  images?: string[];
  material?: string;
  dimensions?: string;
  categoryName?: string;
}) =>
  [
    'مرحباً مهندس خالد 👋',
    'أرغب في عرض سعر للمنتج التالي:',
    '',
    `▪️ المنتج: ${product.title}`,
    product.categoryName ? `▪️ الفئة: ${product.categoryName}` : null,
    product.material ? `▪️ المادة: ${product.material}` : null,
    product.dimensions ? `▪️ الأبعاد: ${product.dimensions.split('\n').join(' | ')}` : null,
    product.images?.[0] ? `▪️ الصورة: ${product.images[0]}` : null,
    `▪️ الرابط: ${productUrl(product._id)}`,
    '',
    'المقاسات / الكمية المطلوبة: ',
  ]
    .filter((line) => line !== null)
    .join('\n');
