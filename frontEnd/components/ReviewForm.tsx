import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReviewFormProps {
  onSubmit?: (review: { rating: number; text: string }) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !text.trim()) {
      setError('يرجى إدخال التقييم والتعليق');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) throw new Error('يجب تسجيل الدخول أولاً');
      const user = JSON.parse(rawUser);
      const res = await fetch('https://khaled-fathe.onrender.com/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          text,
          userId: user.id,
          username: user.username
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'حدث خطأ أثناء الحفظ');
      if (onSubmit) onSubmit({ rating, text });
      // إعادة التوجيه إلى قسم الآراء
      navigate('/#evaluation');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-md mt-10">
      <h2 className="text-xl font-bold mb-4 text-right">إضافة تقييم وتعليق</h2>
      <div className="mb-4 text-right">
        <label className="block mb-2 text-gray-700 dark:text-gray-300">التقييم:</label>
        <div className="flex flex-row-reverse justify-end gap-1">
          {[1,2,3,4,5].map(i => (
            <button
              type="button"
              key={i}
              className={i <= rating ? 'text-yellow-400' : 'text-gray-300'}
              onClick={() => setRating(i)}
              aria-label={`تقييم ${i}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div className="mb-4 text-right">
        <label className="block mb-2 text-gray-700 dark:text-gray-300">التعليق:</label>
        <textarea
          className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800"
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          required
        />
      </div>
      {error && <div className="text-red-500 mb-2 text-right">{error}</div>}
      <button type="submit" className="w-full bg-primary-500 text-white py-2 rounded-md" disabled={loading}>
        {loading ? 'جاري الإرسال...' : 'إرسال'}
      </button>
      <button
        type="button"
        className="w-1/2 mt-2 border bg-red-500 border-gray-300 dark:border-gray-600 text-white py-2 rounded-md"
        onClick={() => {
          setText('');
          setRating(0);
        }}
      >
        مسح
      </button>
      <button
        type="button"
        className="w-1/2 bg-green-500 mt-2 border border-gray-300 dark:border-gray-600 text-white py-2 rounded-md"
        onClick={() => navigate('/#evaluation')}
      >
        عرض الآراء
      </button>
    </form>
  );
};

export default ReviewForm;
