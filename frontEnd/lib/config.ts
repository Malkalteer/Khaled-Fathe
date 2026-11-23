// كل القيم تأتي من ملفات .env.* (انظر .env.example) ولا يوجد أي رابط ثابت داخل الكود.
const trimSlash = (value: string) => value.replace(/\/$/, '');

export const API_URL = trimSlash(import.meta.env.VITE_API_URL || '');
export const SITE_URL = trimSlash(import.meta.env.VITE_SITE_URL || window.location.origin);
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').replace(/\D/g, '');

if (!API_URL && import.meta.env.DEV) {
  console.warn('VITE_API_URL غير مضبوط. أضفه إلى frontEnd/.env.development');
}
