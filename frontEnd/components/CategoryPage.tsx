import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingCart, X } from 'lucide-react';
import { api, Category, Project } from '../services/api';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { ProductRating } from './ProductRating';
import { getProductInteractionStats } from '../services/productInteractions';

// الحفاظ على كامبوننت الـ Modal الخاص بك داخل الصفحة الجديدة ليعمل بكفاءة عند اختيار أي منتج
type ProductDetailsModalProps = {
  project: Project;
  categories: Category[];
  onClose: () => void;
};

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ project, categories, onClose }) => {
  const [mainImgIdx, setMainImgIdx] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [showMore, setShowMore] = React.useState(false);
  const { addToCart, setIsCartOpen } = useCart();
  const images = Array.isArray(project.images) && project.images.length > 0 ? project.images : [];
  const extraDetails = Array.isArray(project.details) ? project.details : [];
  const dimensionLines = project.dimensions ? project.dimensions.split('\n').map(line => line.trim()).filter(Boolean) : [];

  React.useEffect(() => {
    setMainImgIdx(0);
  }, [project._id]);

  React.useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => {
      if (isPaused) return;
      setMainImgIdx((current) => (current + 1) % images.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [images.length, isPaused, project._id]);

  const showPreviousImage = () => {
    setMainImgIdx((current) => (current - 1 + images.length) % images.length);
  };

  const showNextImage = () => {
    setMainImgIdx((current) => (current + 1) % images.length);
  };

  const handleAddToCart = () => {
    const categoryName = categories.find(c => c._id === (typeof project.category === 'string' ? project.category : project.category._id))?.name || 'تصميم مخصص';
    const image = images[0] || '';
    addToCart({
      ...project,
      _id: project._id,
      id: project._id,
      title: project.title,
      name: project.title,
      image,
      imgUrl: image,
      img: image,
      category: categoryName,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-black/70 backdrop-blur-sm overflow-hidden flex items-center justify-center p-0 md:p-6 animate-fade-in" style={{ direction: 'rtl' }}>
      <div className="relative flex flex-col md:flex-row w-full h-full md:max-w-7xl md:h-[min(860px,92vh)] overflow-hidden bg-white dark:bg-gray-900 md:rounded-3xl shadow-2xl animate-modal-in">
        <button onClick={onClose} aria-label="إغلاق التفاصيل" className="absolute top-4 right-4 z-20 w-11 h-11 bg-white/90 dark:bg-gray-800/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="hidden md:flex md:flex-shrink-0 md:w-32 lg:w-44 border-l dark:border-gray-700 dark:bg-gray-800 overflow-y-auto p-4 flex-col gap-3">
          {images.map((img, idx) => (
            <button key={img + idx} onClick={() => setMainImgIdx(idx)} aria-label={`عرض الصورة ${idx + 1}`} className={`rounded-xl overflow-hidden h-20 w-full transition-all duration-300 ${mainImgIdx === idx ? 'ring-4 ring-primary-500 scale-105 opacity-100' : 'opacity-55 hover:opacity-100'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        <div className="relative flex-1 min-h-[52vh] md:min-h-0 flex items-center justify-center p-4 md:p-10 bg-gray-50 dark:bg-gray-800" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
          {images.length > 0 ? <img key={`${project._id}-${mainImgIdx}`} src={images[mainImgIdx]} alt={project.title} className="max-w-full max-h-full object-contain animate-image-in" /> : <span className="text-gray-400">لا توجد صورة</span>}
          {images.length > 1 && <>
            <button onClick={showPreviousImage} aria-label="الصورة السابقة" className="absolute right-4 md:right-8 w-11 h-11 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all"><ChevronRight /></button>
            <button onClick={showNextImage} aria-label="الصورة التالية" className="absolute left-4 md:left-8 w-11 h-11 rounded-full bg-black/35 text-white flex items-center justify-center hover:bg-primary-600 hover:scale-110 transition-all"><ChevronLeft /></button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-3 py-2 rounded-full bg-black/35 backdrop-blur-sm">
              {images.map((img, idx) => <button key={img + idx} onClick={() => setMainImgIdx(idx)} aria-label={`الانتقال إلى الصورة ${idx + 1}`} className={`h-2 rounded-full transition-all ${mainImgIdx === idx ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white'}`} />)}
            </div>
          </>}
        </div>

        <div className="w-full md:w-80 lg:w-96 flex flex-col bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto">
          <div className="flex-1">
          <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            {categories.find(c => c._id === (typeof project.category === 'string' ? project.category : project.category._id))?.name}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{project.title}</h1>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-4">{Number(project.price || 0).toFixed(2)} $</div>

          {project.material && (
            <div className="mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Material used :</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{project.material}</div>
            </div>
          )}

          {dimensionLines.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">Dimensions :</div>
              <div className="space-y-1 mt-2 text-gray-900 dark:text-white">
                {(showMore ? dimensionLines : dimensionLines.slice(0, 2)).map((line, idx) => (
                  <div key={idx} className="font-semibold">{line}</div>
                ))}
                {dimensionLines.length > 2 && (
                  <button type="button" onClick={() => setShowMore((prev) => !prev)} className="mt-2 text-sm font-bold text-primary-600 hover:text-primary-500">
                    {showMore ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          )}

          {extraDetails.length > 0 && (
            <div className="mb-4">
              <div className="space-y-1 text-gray-800 dark:text-gray-200">
                {(showMore ? extraDetails : extraDetails.slice(0, 2)).map((item, idx) => (
                  <div key={idx} className="text-sm">• {item}</div>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{project.description}</p>
          <ProductRating productId={project._id} />
        </div>
          <div className="flex flex-col gap-2 mt-6">
          <button onClick={handleAddToCart} className="flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg text-sm">
            <ShoppingCart size={16} />
            <span>أضف إلى السلة</span>
          </button>
          <a href={`https://wa.me/201143226557?text=${encodeURIComponent(`أرغب في الاستفسار عن المنتج: ${project.title} - ${project.description}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-sm">
            <span>تواصل عبر واتساب</span>
          </a>
          <button onClick={onClose} className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-lg text-sm">رجوع</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// المكون الرئيسي للمسار الجديد
const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>(); // جلب المعرّف الحركي من الرابط
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProject, setModalProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const cats = await api.getCategories();
      const projs = await api.getProjects();

      const withStats = await Promise.all(
        projs.map(async (project) => {
          try {
            const stats = await getProductInteractionStats(project._id);
            return {
              ...project,
              averageRating: stats.averageRating || 0,
              votes: stats.votes || 0,
              favorites: stats.favorites || 0,
              userRating: stats.userRating ?? null,
              userFavorite: Boolean(stats.userFavorite),
            };
          } catch {
            return {
              ...project,
              averageRating: 0,
              votes: 0,
              favorites: 0,
              userRating: null,
              userFavorite: false,
            };
          }
        })
      );

      setCategories(cats);
      setProjects(withStats);
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0); // رفع الصفحة للأعلى عند التحميل
  }, [categoryId]);

  const currentCategory = categories.find(c => c._id === categoryId);

  const handleAddToCart = (project: Project) => {
    const categoryName = categories.find(c => c._id === (typeof project.category === 'string' ? project.category : project.category._id))?.name || currentCategory?.name || 'تصميم مخصص';
    const image = Array.isArray(project.images) && project.images.length > 0 ? project.images[0] : '';
    addToCart({
      ...project,
      _id: project._id,
      id: project._id,
      title: project.title,
      name: project.title,
      image,
      imgUrl: image,
      img: image,
      category: categoryName,
      averageRating: project.averageRating,
      userFavorite: project.userFavorite,
    });
    setIsCartOpen(true);
  };


 // تصفية المنتجات مع دعم خيار "الكل"
const filteredProjects = projects.filter(project => {
  if (categoryId === 'all') return true;

  if (!project.category) return false;
  if (typeof project.category === 'object' && project.category._id) {
    return project.category._id === categoryId;
  }
  return project.category === categoryId;
}).sort((a, b) => {
  const aScore = Number(a.averageRating ?? 0);
  const bScore = Number(b.averageRating ?? 0);
  return bScore - aScore;
});

// 2. قم بإضافة هذا السطر الجديد هنا لحل المشكلة وتوليد الاسم بشكل صحيح:
const currentCategoryName = categoryId === 'all' 
  ? 'جميع التصاميم والمشاريع' 
  : (currentCategory?.name || 'جاري التحميل...');

  return (
    <div className="py-12 bg-gray-50 dark:bg-dark-bg min-h-screen text-right" style={{ direction: 'rtl' }}>
      <Helmet>
      <title>{`تصاميم هندسية - قسم ${currentCategoryName} | KHF Designs`}</title>
      <meta name="description" content={`اكتشف أحدث التصاميم الهندسية ومشاريع الـ CNC الفاخرة في قسم ${currentCategoryName}. تفاصيل ومقاسات المنتجات بدقة عالية.`} />
      <meta name="keywords" content={`تصميم داخلي, هندسة ديكور, CNC, ${currentCategoryName}, أثاث مودرن`} />
      {/* وسم Open Graph لتثبيت شكل الرابط عند مشاركته على واتساب أو فيسبوك */}
      <meta property="og:title" content={`قسم ${currentCategoryName} | KHF Designs`} />
      <meta property="og:image" content={currentCategory?.image || '/logo.png'} />
    </Helmet>
      <div className="container mx-auto px-6">
        
        {/* رأس الصفحة وزر العودة للمسار الرئيسي */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12 border-b border-gray-200 dark:border-gray-800 pb-6">
          <button 
            onClick={() => navigate('/')} // العودة للمسار الافتراضي للـ Portfolio
            className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition w-fit"
          >
            <ArrowRight size={20} />
            <span>العودة للمعرض العام</span>
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              قسم: {currentCategory ? currentCategory.name : 'جاري التحميل...'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              عرض المنتجات المفلترة التابعة لهذا القسم فقط ({filteredProjects.length} مشروع)
            </p>
          </div>
        </div>

        {/* شبكة المنتجات المستقلة للكاتيجوري */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">لا توجد مشاريع مضافة في هذا القسم حتى الآن.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div
                key={project._id}
                className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group animate-card-in"
                style={{ animationDelay: `${Math.min(index * 80, 480)}ms` }}
              >
                <div className="relative overflow-hidden aspect-[4/3] cursor-pointer">
                  <img
                    src={Array.isArray(project.images) && project.images.length > 0 ? project.images[0] : ''}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    onClick={() => setModalProject(project)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                  >
                    <button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl transform -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
                  <ProductRating productId={project._id} compact />
                  <button
                    onClick={() => handleAddToCart(project)}
                    className="mt-4 flex w-full items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-2.5 rounded-xl hover:bg-primary-700 transition"
                  >
                    <ShoppingCart size={16} />
                    أضف للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* شاشة الـ Modal المدمجة في الصفحة الجديدة عند النقر للاطلاع على الأبعاد والصور كاملة */}
      {modalProject && (
        <ProductDetailsModal
          project={modalProject}
          categories={categories}
          onClose={() => setModalProject(null)}
        />
      )}
    </div>
  );
};

export default CategoryPage;