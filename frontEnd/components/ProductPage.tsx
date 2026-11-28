import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Share2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { api, Category, Project, categoryIdOf, categoryIdsOf, categoryNameOf } from '../services/api';
import SimilarProducts from './SimilarProducts';
import { useCart } from '../context/CartContext';
import { ProductRating } from './ProductRating';
import { useToast } from './ui/Toast';
import { productUrl } from '../lib/whatsapp';
import { formatPrice } from '../lib/format';

const ProductPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCart } = useCart();
  const [project, setProject] = useState<Project | null>(null);
  const [related, setRelated] = useState<Project[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setImgIdx(0);
    window.scrollTo(0, 0);
    Promise.all([api.getProject(id), api.getProjects().catch(() => [] as Project[])])
      .then(([p, all]) => {
        if (cancelled) return;
        setProject(p);
        // منتجات تشترك مع هذا المنتج في فئة واحدة على الأقل، الأكثر اشتراكاً ثم الأعلى تقييماً
        const mine = categoryIdsOf(p);
        setRelated(
          all
            .filter((x) => x._id !== p._id)
            .map((x) => ({ x, shared: categoryIdsOf(x).filter((id) => mine.includes(id)).length }))
            .filter(({ shared }) => shared > 0)
            .sort((a, b) => b.shared - a.shared || (b.x.averageRating ?? 0) - (a.x.averageRating ?? 0))
            .slice(0, 12)
            .map(({ x }) => x)
        );
        setError('');
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = project?.images?.length ? project.images : [];

  useEffect(() => {
    if (images.length < 2 || paused) return;
    const timer = window.setInterval(() => setImgIdx((i) => (i + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [images.length, paused]);

  const categoryName = project ? categoryNameOf(project) : '';
  const dimensionLines = useMemo(
    () => (project?.dimensions || '').split('\n').map((l) => l.trim()).filter(Boolean),
    [project?.dimensions]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center gap-4 text-center px-6" dir="rtl">
        <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{error || 'العمل غير موجود'}</p>
        <Link to="/portfolio/all" className="btn-primary">تصفح كل الأعمال</Link>
      </div>
    );
  }

  const share = async () => {
    const url = productUrl(project._id);
    try {
      if (navigator.share) await navigator.share({ title: project.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('تم نسخ رابط المنتج');
      }
    } catch {
      /* المستخدم ألغى المشاركة */
    }
  };

  const cartItem = { _id: project._id, title: project.title, code: project.code, image: images[0] || '', category: categoryName, price: project.price, averageRating: project.averageRating };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: project.title,
    image: images,
    description: project.description || project.title,
    category: categoryName || undefined,
    material: project.material || undefined,
    sku: project.code || undefined,
    url: productUrl(project._id),
    brand: { '@type': 'Brand', name: 'KHF Designs' },
    ...(project.votes
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: project.averageRating, reviewCount: project.votes } }
      : {}),
    ...(project.price
      ? { offers: { '@type': 'Offer', price: project.price, priceCurrency: 'USD', availability: 'https://schema.org/InStock' } }
      : {}),
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-10" dir="rtl">
      <Helmet>
        <title>{`${project.title} | KHF Designs`}</title>
        <meta name="description" content={(project.description || `${project.title} - تصميم وتنفيذ CNC بدقة عالية من KHF Designs`).slice(0, 160)} />
        <link rel="canonical" href={productUrl(project._id)} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${project.title} | KHF Designs`} />
        <meta property="og:description" content={(project.description || '').slice(0, 200)} />
        <meta property="og:url" content={productUrl(project._id)} />
        {images[0] && <meta property="og:image" content={images[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6" aria-label="مسار التنقل">
          <Link to="/" className="hover:text-primary-600">الرئيسية</Link>
          <span>/</span>
          <Link to={`/portfolio/${categoryIdOf(project) || 'all'}`} className="hover:text-primary-600">{categoryName || 'الأعمال'}</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 line-clamp-1">{project.title}</span>
        </nav>

        <div className="grid md:grid-cols-[minmax(0,460px)_1fr] lg:grid-cols-[minmax(0,520px)_1fr] gap-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-4 md:p-6">
          {/* معرض الصور */}
          <div>
            <div
              className="relative aspect-[4/5] w-full rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {images.length > 0 ? (
                <img key={imgIdx} src={images[imgIdx]} alt={`${project.title} - صورة ${imgIdx + 1}`} className="max-w-full max-h-full object-contain animate-image-in" />
              ) : (
                <span className="text-gray-400">لا توجد صورة</span>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} aria-label="الصورة السابقة" className="absolute right-3 w-11 h-11 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-primary-600 transition">
                    <ChevronRight />
                  </button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} aria-label="الصورة التالية" className="absolute left-3 w-11 h-11 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-primary-600 transition">
                    <ChevronLeft />
                  </button>
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                    {imgIdx + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img + idx}
                    onClick={() => setImgIdx(idx)}
                    aria-label={`عرض الصورة ${idx + 1}`}
                    className={`h-20 w-24 shrink-0 rounded-xl overflow-hidden transition ${idx === imgIdx ? 'ring-4 ring-primary-500' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* التفاصيل */}
          <div className="flex flex-col">
            {project.categories && project.categories.length > 0 ? (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {project.categories.map((c) => typeof c === 'object' && (
                  <Link key={c._id} to={`/portfolio/${c._id}`} className="bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-semibold hover:opacity-80">
                    {(c as Category).name}
                  </Link>
                ))}
              </div>
            ) : categoryName && (
              <span className="self-start bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-semibold mb-3">{categoryName}</span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">{project.title}</h1>
            {project.code && (
              <div className="mb-3 text-sm text-gray-500 dark:text-gray-400">
                كود المنتج: <span className="font-mono font-semibold text-gray-700 dark:text-gray-200" dir="ltr">{project.code}</span>
              </div>
            )}
            {project.bestSeller && (
              <span className="self-start mb-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white"><Flame size={13} /> الأكثر مبيعاً</span>
            )}
            <div className={`mb-4 ${Number(project.price) > 0 ? 'text-3xl font-black text-gray-900 dark:text-white' : 'text-xl font-bold text-gray-500 dark:text-gray-400'}`}>{formatPrice(project.price)}</div>
            <ProductRating productId={project._id} initial={project} />

            <dl className="mt-6 space-y-4 text-sm">
              {project.material && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">المادة المستخدمة</dt>
                  <dd className="text-base font-semibold text-gray-900 dark:text-white">{project.material}</dd>
                </div>
              )}
              {dimensionLines.length > 0 && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">الأبعاد</dt>
                  <dd className="mt-1 space-y-0.5 font-semibold text-gray-900 dark:text-white text-right" dir="ltr">
                    {dimensionLines.map((line, i) => <div key={i}>{line}</div>)}
                  </dd>
                </div>
              )}
              {project.details && project.details.length > 0 && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">مواصفات إضافية</dt>
                  <dd>
                    <ul className="mt-1 list-disc pr-5 space-y-1 text-gray-800 dark:text-gray-200">
                      {project.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>

            {project.description && <p className="mt-6 text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">{project.description}</p>}

            <div className="mt-8 grid gap-2">
              <button
                onClick={() => addToCart(cartItem, { open: true })}
                className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold py-3.5 rounded-xl shadow-lg shadow-primary-600/20 transition"
              >
                <ShoppingBag size={20} /> شراء
              </button>
              <button onClick={() => addToCart(cartItem)} className="btn-secondary py-3">
                <ShoppingCart size={16} /> أضف للسلة
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={share} className="btn-ghost">
                  <Share2 size={16} /> مشاركة
                </button>
                <button onClick={() => navigate(-1)} className="btn-ghost">
                  <ArrowRight size={16} /> رجوع
                </button>
              </div>
            </div>
          </div>
        </div>

        <SimilarProducts products={related} />
      </div>
    </div>
  );
};

export default ProductPage;

