import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api, Project, categoryNameOf } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';

const FavoritesPage: React.FC = () => {
  const { user, checking } = useAuth();
  const [favorites, setFavorites] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.getFavorites()
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user && !checking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center px-6 text-center" dir="rtl">
        <div className="max-w-lg card p-8">
          <Heart className="mx-auto mb-4 h-12 w-12 text-red-500" fill="currentColor" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">المفضلة</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">يجب تسجيل الدخول أولاً لعرض المنتجات المفضلة لديك.</p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-6">تسجيل الدخول</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16 dark:bg-dark-bg" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-600">قائمتك</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">المنتجات المفضلة</h1>
          </div>
          <Link to="/" className="btn-secondary">العودة إلى المعرض</Link>
        </div>

        {loading || checking ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-dark-card dark:text-gray-400">
            لا توجد منتجات مفضلة حتى الآن.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((product, i) => (
              <ProductCard key={product._id} project={product} index={i} categoryName={categoryNameOf(product)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
