const API_URL = 'https://khaled-fathe.onrender.com';

export type ProductInteractionStats = {
  productId: string;
  averageRating: number;
  votes: number;
  favorites: number;
  userRating: number | null;
  userFavorite: boolean;
};

export const getProductInteractionStats = async (productId: string): Promise<ProductInteractionStats> => {
  const res = await fetch(`${API_URL}/api/product-interactions/${productId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'تعذّر تحميل تقييم المنتج');
  }

  return res.json();
};

export const saveProductInteraction = async (productId: string, payload: { rating?: number; favorite?: boolean }): Promise<ProductInteractionStats> => {
  const res = await fetch(`${API_URL}/api/product-interactions/${productId}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'تعذّر حفظ تقييم المنتج');
  }

  return await getProductInteractionStats(productId);
};
