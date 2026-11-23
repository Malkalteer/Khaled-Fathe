import React, { useEffect, useMemo, useState } from 'react';
import { Check, EyeOff, MessageSquareQuote, Trash2 } from 'lucide-react';
import { api, Review } from '../../services/api';
import { useConfirm } from '../ui/Dialog';
import { useToast } from '../ui/Toast';
import { useAdmin } from './AdminDashboard';
import { EmptyState, ListSkeleton, PageHeader, Stars, timeAgo } from './ui';

type Tab = 'pending' | 'approved' | 'all';

const ReviewsPanel: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('pending');
  const toast = useToast();
  const confirm = useConfirm();
  const { refreshStats } = useAdmin();

  useEffect(() => {
    api.admin.reviews()
      .then((list) => {
        setReviews(list);
        if (!list.some((r) => !r.approved)) setTab('all');
      })
      .catch((e) => toast.error(e))
      .finally(() => setLoading(false));
  }, [toast]);

  const counts = useMemo(() => ({
    pending: reviews.filter((r) => !r.approved).length,
    approved: reviews.filter((r) => r.approved).length,
    all: reviews.length,
  }), [reviews]);

  const shown = reviews.filter((r) => (tab === 'all' ? true : tab === 'pending' ? !r.approved : r.approved));

  const setApproved = async (review: Review, approved: boolean) => {
    try {
      await api.admin.setReviewApproved(review._id, approved);
      setReviews((list) => list.map((r) => (r._id === review._id ? { ...r, approved } : r)));
      toast.success(approved ? 'تم نشر التقييم' : 'تم إخفاء التقييم');
      refreshStats();
    } catch (error) {
      toast.error(error);
    }
  };

  const remove = async (review: Review) => {
    if (!(await confirm({ title: 'حذف التقييم؟', message: `تقييم ${review.username} سيُحذف نهائياً.`, confirmText: 'حذف', danger: true }))) return;
    try {
      await api.admin.deleteReview(review._id);
      setReviews((list) => list.filter((r) => r._id !== review._id));
      toast.success('تم حذف التقييم');
      refreshStats();
    } catch (error) {
      toast.error(error);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'pending', label: 'بانتظار الموافقة' },
    { key: 'approved', label: 'منشورة' },
    { key: 'all', label: 'الكل' },
  ];

  return (
    <div>
      <PageHeader title="التقييمات" description="التقييمات الجديدة لا تظهر في الموقع حتى توافق عليها." />

      <div className="mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'}`}
          >
            {t.label}
            <span className={`mr-2 rounded-full px-2 py-0.5 text-xs ${tab === t.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'}`}>{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton />
      ) : shown.length === 0 ? (
        <EmptyState icon={<MessageSquareQuote size={26} />} title={tab === 'pending' ? 'لا توجد تقييمات معلّقة 🎉' : 'لا توجد تقييمات'} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shown.map((r) => (
            <article key={r._id} className={`card p-5 ${!r.approved ? 'border-r-4 border-r-amber-400' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900 dark:text-primary-200">
                  {r.username?.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">{r.username}</span>
                    <Stars value={r.rating} />
                  </div>
                  <div className="text-xs text-gray-500">{timeAgo(r.createdAt)}</div>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300">{r.text}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
                {r.approved ? (
                  <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Check size={12} /> منشور</span>
                ) : (
                  <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">بانتظار الموافقة</span>
                )}
                <div className="flex gap-2">
                  {r.approved ? (
                    <button onClick={() => setApproved(r, false)} className="btn-secondary !py-1.5"><EyeOff size={14} /> إخفاء</button>
                  ) : (
                    <button onClick={() => setApproved(r, true)} className="btn !py-1.5 bg-emerald-600 text-white hover:bg-emerald-700"><Check size={14} /> موافقة ونشر</button>
                  )}
                  <button onClick={() => remove(r)} className="btn-icon hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950/40" aria-label="حذف"><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPanel;
