import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, EyeOff, FileText, FolderTree, Heart, MessageSquareQuote, Package, Plus, Star, Users } from 'lucide-react';
import { useAdmin } from './AdminDashboard';
import { PageHeader, Skeleton, Stars, timeAgo } from './ui';
import { QuoteStatusBadge } from './QuotesPanel';

const StatCard: React.FC<{ label: string; value: React.ReactNode; hint?: React.ReactNode; icon: React.ReactNode; tone: string; to?: string }> = ({ label, value, hint, icon, tone, to }) => {
  const body = (
    <div className="card flex items-start gap-4 p-5 transition hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <div className="min-w-0">
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
        <div className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
        {hint && <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
};

const Overview: React.FC = () => {
  const { stats } = useAdmin();

  return (
    <div>
      <PageHeader
        title="نظرة عامة"
        description="ملخص سريع لنشاط الموقع"
        actions={
          <>
            <Link to="/admin/projects?new=1" className="btn-primary"><Plus size={16} /> عمل جديد</Link>
            <Link to="/admin/categories?new=1" className="btn-secondary"><Plus size={16} /> فئة جديدة</Link>
          </>
        }
      />

      {!stats ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard to="/admin/quotes" label="طلبات عرض السعر" value={stats.quotes} hint={stats.newQuotes ? <span className="font-semibold text-red-500">{stats.newQuotes} طلب جديد</span> : 'لا طلبات جديدة'} icon={<FileText size={20} />} tone="bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300" />
            <StatCard to="/admin/reviews" label="التقييمات" value={stats.reviews} hint={stats.pendingReviews ? <span className="font-semibold text-red-500">{stats.pendingReviews} بانتظار الموافقة</span> : `متوسط ${stats.averageReview || '—'} / 5`} icon={<MessageSquareQuote size={20} />} tone="bg-yellow-100 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-300" />
            <StatCard to="/admin/projects" label="الأعمال" value={stats.projects} hint={stats.hiddenProjects ? <span className="inline-flex items-center gap-1"><EyeOff size={12} /> {stats.hiddenProjects} مخفي</span> : 'كلها ظاهرة'} icon={<Package size={20} />} tone="bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300" />
            <StatCard to="/admin/users" label="المستخدمون" value={stats.users} hint={`+${stats.newUsers} هذا الأسبوع`} icon={<Users size={20} />} tone="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" />
            <StatCard to="/admin/categories" label="الفئات" value={stats.categories} icon={<FolderTree size={20} />} tone="bg-violet-100 text-violet-600 dark:bg-violet-950 dark:text-violet-300" />
            <StatCard label="مرات الإضافة للمفضلة" value={stats.favorites} icon={<Heart size={20} />} tone="bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300" />
            <StatCard label="متوسط تقييم العملاء" value={stats.averageReview || '—'} hint={<Stars value={stats.averageReview} size={12} />} icon={<Star size={20} />} tone="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300" />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="card">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h2 className="font-bold">أحدث طلبات عرض السعر</h2>
                <Link to="/admin/quotes" className="inline-flex items-center gap-1 text-sm text-primary-600">الكل <ArrowLeft size={14} /></Link>
              </div>
              {stats.latestQuotes.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-500">لا توجد طلبات بعد</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.latestQuotes.map((q) => (
                    <li key={q._id} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{q.name}</div>
                        <div className="text-xs text-gray-500" dir="ltr">{q.phone} · {timeAgo(q.createdAt)}</div>
                      </div>
                      {q.file?.name && <span className="hidden truncate text-xs text-gray-500 sm:block max-w-[120px]" dir="ltr">{q.file.name}</span>}
                      <QuoteStatusBadge status={q.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h2 className="font-bold">تقييمات بانتظار الموافقة</h2>
                <Link to="/admin/reviews" className="inline-flex items-center gap-1 text-sm text-primary-600">الكل <ArrowLeft size={14} /></Link>
              </div>
              {stats.latestReviews.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-500">لا توجد تقييمات معلّقة 🎉</p>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.latestReviews.map((r) => (
                    <li key={r._id} className="px-5 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold">{r.username}</span>
                        <Stars value={r.rating} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{r.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card lg:col-span-2">
              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                <h2 className="font-bold">الأعمال الأعلى تقييماً</h2>
              </div>
              {stats.topRated.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-gray-500">لم يقيّم العملاء أي عمل بعد</p>
              ) : (
                <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
                  {stats.topRated.map((p, i) => (
                    <li key={p._id}>
                      <Link to={`/project/${p._id}`} target="_blank" className="block overflow-hidden rounded-xl border border-gray-100 transition hover:shadow-md dark:border-gray-800">
                        <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                          {p.image && <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover" />}
                          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">#{i + 1}</span>
                        </div>
                        <div className="p-3">
                          <div className="truncate text-sm font-semibold">{p.title}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-gray-500"><Stars value={p.avg} size={12} /> {p.avg} ({p.votes})</div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
