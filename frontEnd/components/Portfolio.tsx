import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Store } from 'lucide-react';
import { api, Category, Project, categoryIdOf, categoryIdsOf } from '../services/api';
import ProductCard from './ProductCard';

const BEST_SELLERS_LIMIT = 6;

/** قسم «المتجر» في الصفحة الرئيسية: الأكثر مبيعاً ثم الفئات */
const Portfolio: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // طلبان فقط: الإحصائيات تأتي مع قائمة المنتجات نفسها
    Promise.all([api.getCategoryList(), api.getProjects()])
      .then(([cats, projs]) => {
        if (cancelled) return;
        setCategories(cats);
        setProjects(projs);
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // المنتجات التي حددها المدير «الأكثر مبيعاً»، وإن لم يحدد شيئاً: الأعلى تقييماً ثم الأكثر إضافة للمفضلة
  const bestSellers = useMemo(() => {
    const flagged = projects.filter((p) => p.bestSeller);
    if (flagged.length > 0) return flagged.slice(0, BEST_SELLERS_LIMIT);
    return [...projects]
      .sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0) || (b.favorites ?? 0) - (a.favorites ?? 0) || (b.votes ?? 0) - (a.votes ?? 0))
      .slice(0, BEST_SELLERS_LIMIT);
  }, [projects]);

  const countByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p) => categoryIdsOf(p).forEach((id) => {
      map[id] = (map[id] || 0) + 1;
    }));
    return map;
  }, [projects]);

  const categoryName = (p: Project) => categories.find((c) => c._id === categoryIdOf(p))?.name;

  return (
    <section id="portfolio" className="scroll-mt-28 py-20 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Store className="text-primary-600" />
            المتجر
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* ===== الأكثر مبيعاً ===== */}
            {bestSellers.length > 0 && (
              <div id="best-sellers">
                <h3 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
                  <Flame className="text-amber-500" /> الأكثر مبيعاً
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {bestSellers.map((project, index) => (
                    <ProductCard key={project._id} project={project} index={index} categoryName={categoryName(project)} />
                  ))}
                </div>
              </div>
            )}

            {/* ===== الفاصل ===== */}
            <div className="my-14 flex items-center gap-4" role="separator">
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300 dark:to-gray-700" />
              <p className="max-w-2xl text-center text-gray-600 dark:text-gray-400">
                جولة في أحدث مشاريعنا الهندسية. اضغط على أي فئة للانتقال لصفحة المنتجات الخاصة بها.
              </p>
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gray-300 dark:to-gray-700" />
            </div>

            {/* ===== الفئات: صور بنسبة 1080×1350 (4:5) ===== */}
            {categories.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-lg">لا توجد فئات حالياً</div>
            ) : (
              <div id="categories" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((cat, index) => (
                  <Link
                    key={cat._id}
                    to={`/portfolio/${cat._id}`}
                    className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 shadow-lg animate-card-in"
                    style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
                      <h3 className="text-lg md:text-2xl font-bold text-white">{cat.name}</h3>
                      <span className="text-xs md:text-sm text-white/80">{countByCategory[cat._id] || 0} منتج</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Portfolio;
