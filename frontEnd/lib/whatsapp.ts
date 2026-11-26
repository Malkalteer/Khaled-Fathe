import { SITE_URL, WHATSAPP_NUMBER } from './config';

export const whatsappLink = (message: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

export const productUrl = (id: string) => `${SITE_URL}/project/${id}`;
