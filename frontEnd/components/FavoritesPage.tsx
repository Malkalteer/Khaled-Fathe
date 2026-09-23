import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { saveProductInteraction } from '../services/productInteractions';

interface FavoriteProject {
  _id: string;
  title: string;
  description: string;
  images: string[];
  category?: { _id?: string; name?: string } | string;
  averageRating?: number;
  votes?: number;
  favorites?: number;
}

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteProject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadFavorites = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('https://khaled-fathe.onrender.com/api/product-interactions/favorites', {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('تعذّر تحميل المفضلة');
      }

      const data = await res.json();
      setFavorites(data || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleFavoriteToggle = async (productId: string) => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }

    const current = favorites.find((item) => item._id === productId);
    const nextFavorite = !current;

    try {
      await saveProductInteraction(productId, { favorite: nextFavorite });
      if (nextFavorite) {
        await loadFavorites();
      } else {
        setFavorites((prev) => prev.filter((item) => item._id !== productId));
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  };

  if (!localStorage.getItem('user')) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-6 text-center" dir="rtl">
        <div className="max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-800 dark:bg-dark-card">
          <Heart className="mx-auto mb-4 h-12 w-12 text-red-500" fill="currentColor" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المفضلة</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">يجب تسجيل الدخول أولاً لعرض المنتجات المفضلة لديك.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 rounded-xl bg-primary-600 px-5 py-2.5 text-white font-semibold hover:bg-primary-700"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16 dark:bg-dark-bg" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-600">قائمةك</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المنتجات المفضلة</h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            العودة إلى المعرض
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-dark-card dark:text-gray-400">
            لا توجد منتجات مفضلة حتى الآن.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((product) => (
              <div
                key={product._id}
                className="overflow-hidden rounded-2xl bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-dark-card"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ''}
                    alt={product.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{product.title}</h3>
                    <button
                      type="button"
                      onClick={() => handleFavoriteToggle(product._id)}
                      aria-label="إزالة من المفضلة"
                      className="rounded-full border border-red-200 bg-red-50 p-1.5 text-red-500 transition hover:scale-105"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-500 dark:text-gray-400">{product.description}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.averageRating ? product.averageRating.toFixed(1) : '0.0'} / 5</span>
                    <span>•</span>
                    <span>{product.votes || 0} صوت</span>
                  </div>

                  <button
                    onClick={() => navigate(`/portfolio/${typeof product.category === 'object' && product.category ? product.category._id : 'all'}`)}
                    className="w-full rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    عرض المنتج
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
