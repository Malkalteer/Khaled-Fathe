import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { api, Category, Project } from '../services/api';
import { Helmet } from 'react-helmet-async';

// الحفاظ على كامبوننت الـ Modal الخاص بك داخل الصفحة الجديدة ليعمل بكفاءة عند اختيار أي منتج
type ProductDetailsModalProps = {
  project: Project;
  categories: Category[];
  onClose: () => void;
};

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ project, categories, onClose }) => {
  const [mainImgIdx, setMainImgIdx] = React.useState(0);
  const images = Array.isArray(project.images) && project.images.length > 0 ? project.images : [];

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-white dark:bg-gray-900 overflow-hidden flex" style={{ direction: 'rtl' }}>
      <button onClick={onClose} className="absolute top-4 right-4 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="hidden md:flex md:flex-shrink-0 md:w-32 md:lg:w-52 md:border-l dark:md:border-gray-700 dark:md:bg-gray-800 md:overflow-y-auto p-4">
        {images.map((img, idx) => (
          <button key={idx} onClick={() => setMainImgIdx(idx)} className={`mb-3 rounded-lg overflow-hidden h-20 w-full ${mainImgIdx === idx ? 'ring-3 ring-primary-600' : 'opacity-60'}`}>
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800">
        <img src={images[mainImgIdx]} alt={project.title} className="max-w-full max-h-full object-contain" />
      </div>

      <div className="w-80 md:lg:w-96 flex flex-col bg-white dark:bg-gray-900 p-6 md:p-8 overflow-y-auto">
        <div className="flex-1">
          <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            {categories.find(c => c._id === (typeof project.category === 'string' ? project.category : project.category._id))?.name}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{project.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{project.description}</p>
        </div>
        <div className="flex flex-col gap-2 mt-6">
          <a href={`https://wa.me/201143226557?text=أرغب في معرفة تفاصيل المنتج: ${project.title}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg text-sm">
            <span>تواصل عبر واتساب</span>
          </a>
          <button onClick={onClose} className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-lg text-sm">رجوع</button>
        </div>
      </div>
    </div>
  );
};

// المكون الرئيسي للمسار الجديد
const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>(); // جلب المعرّف الحركي من الرابط
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalProject, setModalProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const cats = await api.getCategories();
      const projs = await api.getProjects();
      setCategories(cats);
      setProjects(projs);
      setLoading(false);
    };
    fetchData();
    window.scrollTo(0, 0); // رفع الصفحة للأعلى عند التحميل
  }, [categoryId]);

  const currentCategory = categories.find(c => c._id === categoryId);

 // تصفية المنتجات مع دعم خيار "الكل"
const filteredProjects = projects.filter(project => {
  // 1. إذا كان المعرّف القادم من الرابط هو 'all'، اعرض المنتج مباشرة دون تصفية
  if (categoryId === 'all') return true;

  // 2. خلاف ذلك، قم بالتصفية الطبيعية بناءً على الـ ID الخاص بالكاتيجوري
  if (!project.category) return false;
  if (typeof project.category === 'object' && project.category._id) {
    return project.category._id === categoryId;
  }
  return project.category === categoryId;
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
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
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
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
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