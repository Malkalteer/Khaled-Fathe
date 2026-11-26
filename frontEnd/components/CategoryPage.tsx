import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { api, Category, Project, categoryIdOf, categoryNameOf } from '../services/api';
import ProductCard from './ProductCard';
import { SITE_URL } from '../lib/config';

type SortKey = 'default' | 'rating' | 'price-asc' | 'price-desc';

const CategoryPage: React.FC = () => {
  const { categoryId = 'all' } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('rating');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([api.getCategoryList(), api.getProjects()])
      .then(([cats, projs]) => {
        if (cancelled) return;
        setCategories(cats);
        setProjects(projs);
        setError('');
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const currentCategory = categories.find((c) => c._id === categoryId);
  const currentCategoryName = categoryId === 'all' ? 'جميع المنتجات' : currentCategory?.name || (loading ? 'جاري التحميل...' : 'قسم غير موجود');

  const filteredProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = projects.filter(
      (p) =>
        (categoryId === 'all' || categoryIdOf(p) === categoryId) &&
        (!q || p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || (p.material || '').toLowerCase().includes(q))
    );
    const sorted = [...list];
    if (sort === 'rating') sorted.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
    if (sort === 'price-asc') sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sort === 'price-desc') sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    return sorted;
  }, [projects, categoryId, query, sort]);

  return (
    <div className="py-12 bg-gray-50 dark:bg-dark-bg min-h-screen text-right" dir="rtl">
      <Helmet>
        <title>{`${currentCategoryName} | KHF Designs`}</title>
        <meta name="description" content={`اكتشف أحدث التصاميم الهندسية ومشاريع الـ CNC في قسم ${currentCategoryName}. تفاصيل ومقاسات المنتجات بدقة عالية.`} />
        <link rel="canonical" href={`${SITE_URL}/portfolio/${categoryId}`} />
        <meta property="og:title" content={`${currentCategoryName} | KHF Designs`} />
        <meta property="og:image" content={currentCategory?.image || `${SITE_URL}/logo.webp`} />
      </Helmet>

      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{currentCategoryName}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filteredProjects.length} منتج</p>
          </div>
          <button
            onClick={() => navigate('/#portfolio')}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition w-fit"
          >
            <ArrowRight size={20} />
            <span>العودة للمتجر</span>
          </button>
        </div>

        {/* الفئات + البحث والترتيب */}
        <div className="flex flex-col lg:flex-row gap-4 mb-10">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'thin' }}>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => navigate(`/portfolio/${cat._id}`)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cat._id === categoryId
                    ? 'bg-primary-600 text-white shadow'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <label className="relative flex-1 lg:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالاسم أو المادة..." className="field pr-9" aria-label="بحث" />
            </label>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="field w-auto" aria-label="ترتيب">
              <option value="rating">الأعلى تقييماً</option>
              <option value="default">ترتيب المعرض</option>
              <option value="price-asc">السعر: من الأقل</option>
              <option value="price-desc">السعر: من الأعلى</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-dark-card shadow overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">لا توجد منتجات مطابقة.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <ProductCard key={project._id} project={project} index={index} categoryName={categoryNameOf(project, categories)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
