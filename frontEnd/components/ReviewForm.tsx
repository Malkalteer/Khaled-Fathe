import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from './ui/Toast';

const labels = ['', 'سيئ', 'مقبول', 'جيد', 'جيد جداً', 'ممتاز'];

const ReviewForm: React.FC = () => {
  const { user, checking } = useAuth();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || text.trim().length < 3) {
      setError('يرجى اختيار التقييم وكتابة تعليق (3 أحرف على الأقل)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // اسم ومعرّف المستخدم يأخذهما الخادم من الجلسة
      const res = await api.addReview(rating, text.trim());
      toast.success(res.message);
      navigate('/#evaluation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  if (!user && !checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4" dir="rtl">
        <div className="card p-8 text-center max-w-md">
          <p className="text-gray-700 dark:text-gray-200">يجب تسجيل الدخول لإضافة تقييم.</p>
          <Link to="/login" className="btn-primary mt-4">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-16 px-4" dir="rtl">
      <form onSubmit={handleSubmit} className="card max-w-md mx-auto p-6 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">أضف تقييمك</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">رأيك يساعدنا ويساعد العملاء الآخرين. يظهر التقييم بعد مراجعة الإدارة.</p>
        </div>
        <div>
          <span className="field-label">التقييم</span>
          <div className="flex items-center gap-3">
            <div className="flex gap-1" dir="ltr" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  type="button"
                  key={i}
                  className={`text-3xl leading-none transition ${i <= shown ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'} hover:scale-110`}
                  onClick={() => setRating(i)}
                  onMouseEnter={() => setHover(i)}
                  aria-label={`تقييم ${i} من 5`}
                  aria-pressed={rating === i}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-500">{labels[shown]}</span>
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="review-text">التعليق</label>
          <textarea id="review-text" className="field" rows={5} value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} required />
          <div className="mt-1 text-xs text-gray-400 text-left">{text.length}/1000</div>
        </div>
        {error && <div className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-600" role="alert">{error}</div>}
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading ? <><Loader2 className="animate-spin" size={18} /> جاري الإرسال...</> : 'إرسال التقييم'}
        </button>
        <button type="button" className="btn-ghost w-full" onClick={() => navigate('/#evaluation')}>عرض الآراء</button>
      </form>
    </div>
  );
};

export default ReviewForm;
