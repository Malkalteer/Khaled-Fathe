import React, { useEffect, useMemo, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { getProductInteractionStats, saveProductInteraction } from '../services/productInteractions';

const formatAverage = (average: number) => Number.isFinite(average) ? average.toFixed(1) : '0.0';

export const ProductRating: React.FC<{ productId: string; compact?: boolean }> = ({ productId, compact = false }) => {
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [favorites, setFavorites] = useState(0);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userFavorite, setUserFavorite] = useState(false);
  const [hoverValue, setHoverValue] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      const stats = await getProductInteractionStats(productId);
      setAverage(stats.averageRating || 0);
      setCount(stats.votes || 0);
      setFavorites(stats.favorites || 0);
      setUserRating(stats.userRating ?? null);
      setUserFavorite(Boolean(stats.userFavorite));
    } catch {
      setAverage(0);
      setCount(0);
      setFavorites(0);
      setUserRating(null);
      setUserFavorite(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [productId]);

  const handleRate = async (nextValue: number) => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً لتقييم المنتج');
      return;
    }

    setLoading(true);
    try {
      await saveProductInteraction(productId, { rating: nextValue });
      await loadStats();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذّر حفظ التقييم';
      alert(message.includes('غير مصرح') || message.includes('انتهت الجلسة')
        ? 'يرجى تسجيل الدخول أولاً لتقييم المنتج'
        : message);
    } finally {
      setLoading(false);
      setHoverValue(0);
    }
  };

  const handleFavoriteToggle = async () => {
    const user = localStorage.getItem('user');
    if (!user) {
      alert('يرجى تسجيل الدخول أولاً لإضافة المنتج إلى المفضلة');
      return;
    }

    const nextFavorite = !userFavorite;
    setLoading(true);

    try {
      await saveProductInteraction(productId, { favorite: nextFavorite });
      await loadStats();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذّر تحديث المفضلة';
      alert(message.includes('غير مصرح') || message.includes('انتهت الجلسة')
        ? 'يرجى تسجيل الدخول أولاً لإضافة المنتج إلى المفضلة'
        : message);
    } finally {
      setLoading(false);
    }
  };

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);
  const visibleStars = hoverValue || userRating || Math.round(average) || 0;

  return (
    <div className={`flex ${compact ? 'items-center justify-start gap-2' : 'flex-col items-start gap-2'} mt-3`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1" dir="ltr">
          {stars.map((star) => {
            const filled = star <= visibleStars;
            return (
              <button
                key={star}
                type="button"
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverValue(star)}
                onMouseLeave={() => setHoverValue(0)}
                disabled={loading}
                aria-label={`تقييم ${star} نجوم`}
                className="bg-transparent border-0 p-0 cursor-pointer leading-none disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 transition-all duration-200 ${filled ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)]' : 'text-gray-300 dark:text-gray-600'} hover:scale-110`}
                  fill={filled ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M12 2.25l2.8 5.68 6.27.91-4.53 4.42 1.07 6.24L12 0.25 6.39 19.5l1.07-6.24L2.93 8.84l6.27-.91L12 2.25z" />
                </svg>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleFavoriteToggle}
          disabled={loading}
          aria-label={userFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          className={`flex items-center justify-center rounded-full border transition ${
            userFavorite
              ? 'border-red-200 bg-red-50 text-red-500'
              : 'border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          } p-1.5 disabled:cursor-not-allowed`}
        >
          <Heart className={`h-4 w-4 ${userFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span>{count > 0 ? `${formatAverage(average)} / 5` : 'لا توجد تقييمات'}</span>
        <span className="text-yellow-500">•</span>
        <span>{count} صوت{count === 1 ? '' : 'ات'}</span>
        <span className="text-red-500">•</span>
        <span>{favorites} مفضلة</span>
      </div>
    </div>
  );
};
