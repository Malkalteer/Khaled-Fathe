import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api, ProductStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';

const formatAverage = (average: number) => (Number.isFinite(average) ? average.toFixed(1) : '0.0');

interface Props {
  productId: string;
  compact?: boolean;
  /** الإحصائيات القادمة مع قائمة المنتجات — لا حاجة لطلب إضافي */
  initial?: ProductStats;
  onChange?: (stats: ProductStats) => void;
}

const normalize = (s?: ProductStats) => ({
  averageRating: s?.averageRating || 0,
  votes: s?.votes || 0,
  favorites: s?.favorites || 0,
  userRating: s?.userRating ?? null,
  userFavorite: Boolean(s?.userFavorite),
});

export const ProductRating: React.FC<Props> = ({ productId, compact = false, initial, onChange }) => {
  const [stats, setStats] = useState(() => normalize(initial));
  const [hoverValue, setHoverValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setStats(normalize(initial));
  }, [initial?.averageRating, initial?.votes, initial?.favorites, initial?.userRating, initial?.userFavorite]);

  const save = async (payload: { rating?: number; favorite?: boolean }, needLoginMsg: string) => {
    if (!user) {
      toast.info(needLoginMsg);
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const next = normalize(await api.saveInteraction(productId, payload));
      setStats(next);
      onChange?.(next);
      if (payload.favorite !== undefined) toast.success(payload.favorite ? 'أُضيف إلى المفضلة' : 'أُزيل من المفضلة');
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
      setHoverValue(0);
    }
  };

  const visibleStars = hoverValue || stats.userRating || Math.round(stats.averageRating) || 0;

  return (
    <div className={`flex ${compact ? 'items-center justify-start gap-2' : 'flex-col items-start gap-2'} mt-3`}>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1" dir="ltr" onMouseLeave={() => setHoverValue(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= visibleStars;
            return (
              <button
                key={star}
                type="button"
                onClick={() => save({ rating: star }, 'سجّل الدخول أولاً لتقييم المنتج')}
                onMouseEnter={() => setHoverValue(star)}
                disabled={loading}
                aria-label={`تقييم ${star} من 5`}
                className="bg-transparent border-0 p-0 cursor-pointer leading-none disabled:cursor-not-allowed"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 transition-all duration-200 ${filled ? 'text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' : 'text-gray-300 dark:text-gray-600'} hover:scale-110`}
                  fill={filled ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M12 2.25l2.8 5.68 6.27.91-4.53 4.42 1.07 6.24L12 16.6l-5.61 2.9 1.07-6.24L2.93 8.84l6.27-.91L12 2.25z" />
                </svg>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => save({ favorite: !stats.userFavorite }, 'سجّل الدخول أولاً لإضافة المنتج إلى المفضلة')}
          disabled={loading}
          aria-pressed={stats.userFavorite}
          aria-label={stats.userFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          className={`flex items-center justify-center rounded-full border transition p-1.5 disabled:cursor-not-allowed ${
            stats.userFavorite
              ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-900 dark:bg-red-950/40'
              : 'border-gray-200 bg-white text-gray-400 hover:text-red-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <Heart className={`h-4 w-4 ${stats.userFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span>{stats.votes > 0 ? `${formatAverage(stats.averageRating)} / 5` : 'لا توجد تقييمات'}</span>
        <span className="text-yellow-500">•</span>
        <span>{stats.votes} {stats.votes === 1 ? 'صوت' : 'أصوات'}</span>
        <span className="text-red-500">•</span>
        <span>{stats.favorites} مفضلة</span>
      </div>
    </div>
  );
};
