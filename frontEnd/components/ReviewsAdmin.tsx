import React, { useEffect, useState } from 'react';

interface Review {
  _id: string;
  username: string;
  rating: number;
  text: string;
  createdAt: string;
}

const ReviewsAdmin: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('https://khaled-fathe.onrender.com/api/reviews');
      const data = await res.json();
      setReviews(data);
      setError('');
    } catch {
      setError('تعذر تحميل التعليقات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    setDeleting(id);
    try {
      const res = await fetch(`https://khaled-fathe.onrender.com/api/reviews/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل الحذف');
      setReviews(reviews => reviews.filter(r => r._id !== id));
    } catch {
      alert('حدث خطأ أثناء الحذف');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6 text-right">كل التعليقات</h2>
      {loading ? (
        <div className="text-center text-gray-500">جاري التحميل...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-400">لا توجد تعليقات بعد.</div>
      ) : (
        <div className="space-y-6">
          {reviews.map(r => (
            <div key={r._id} className="bg-white dark:bg-dark-card border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{r.username}</div>
                <div className="text-sm text-gray-500 mb-2">{new Date(r.createdAt).toLocaleString('ar-EG')}</div>
                <div className="text-yellow-400 mb-2">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <div className="text-gray-700 dark:text-gray-200">{r.text}</div>
              </div>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:opacity-60"
                onClick={() => handleDelete(r._id)}
                disabled={deleting === r._id}
              >
                {deleting === r._id ? 'جاري الحذف...' : 'حذف التعليق'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsAdmin;
