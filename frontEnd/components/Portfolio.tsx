import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { api, Category, Project } from '../services/api';

// تعريف مكون التفاصيل خارج Portfolio وقبلها
type ProductDetailsModalProps = {
  project: Project;
  categories: Category[];
  onClose: () => void;
};

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ project, categories, onClose }) => {
  const [mainImgIdx, setMainImgIdx] = React.useState(0);
  const images = Array.isArray(project.images) && project.images.length > 0 ? project.images : [];
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col min-h-screen w-full overflow-auto">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl mx-auto py-12 px-4 relative gap-8">
        {/* قسم الصور */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {/* الصورة الرئيسية */}
          <div className="w-full aspect-[4/3] mb-2">
            {images.length > 0 ? (
              <img
                src={images[mainImgIdx]}
                alt={project.title + ' الرئيسية'}
                className="w-full h-full object-cover rounded-xl shadow border-2 border-primary-600"
                style={{ minHeight: 250, maxHeight: 350 }}
              />
            ) : (
              <div className="w-full h-80 flex items-center justify-center bg-gray-200 rounded-xl">لا توجد صور</div>
            )}
          </div>
          {/* شبكة الصور الفرعية */}
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={project.title + ' صورة ' + (idx + 1)}
                className={`w-full h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${mainImgIdx === idx ? 'border-primary-600 scale-105' : 'border-gray-300 opacity-80 hover:opacity-100'}`}
                onClick={() => setMainImgIdx(idx)}
              />
            ))}
          </div>
        </div>
        {/* قسم التفاصيل */}
        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
          <h3 className="text-2xl font-bold mb-4 text-center md:text-right">{project.title}</h3>
          <div className="mb-2 text-lg text-primary-600 font-semibold text-center md:text-right">{categories.find(c => c._id === (typeof project.category === 'string' ? project.category : project.category._id))?.name}</div>
          <div className="mb-6 text-gray-700 dark:text-gray-200 text-center md:text-right">{project.description}</div>
          <div className="flex items-center gap-4 flex-wrap">
            <a href={`https://wa.me/201143226557?text=ارغب في معرفة تفاصيل المنتج ${project.title} ${project.description}`} target="_blank" rel="noopener noreferrer" className="block text-center bg-green-500 hover:bg-green-800 text-white rounded p-3 text-sm font-bold mt-4 hover:bg-primary-700 transition ">تواصل عبر واتساب</a>
            <button onClick={onClose} className="block text-center bg-blue-500 hover:bg-blue-700 text-white rounded p-3 text-sm font-bold mt-4 transition-colors duration-300">رجوع للمعرض</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Portfolio: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
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
  }, []);

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(project => {
      if (!project.category) return false;
      if (typeof project.category === 'object' && project.category._id) {
        return project.category._id === activeCategory;
      }
      return project.category === activeCategory;
    });

  return (
    <section id="portfolio" className="scroll-mt-28 py-20 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="container mx-auto px-6">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Layers className="text-primary-600" />
            معرض الأعمال
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            جولة في أحدث مشاريعنا التي تم تنفيذها باستخدام أحدث برامج التصميم الهندسي.
          </p>
        </div>

        {/* ===== قسم الفئات ===== */}
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
          @keyframes scroll-hint {
            0%   { transform: translateX(0); }
            20%  { transform: translateX(-20px); }
            40%  { transform: translateX(16px); }
            60%  { transform: translateX(-10px); }
            80%  { transform: translateX(6px); }
            100% { transform: translateX(0); }
          }
          @media (max-width: 1023px) {
            .categories-inner { animation: scroll-hint 2.5s ease-in-out 0.8s infinite both; }
          }
        `}</style>

        <div
          className="overflow-x-auto mb-12 py-4 px-2 hide-scroll"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="categories-inner flex gap-6 snap-x w-max mx-auto">

            {categories.map((cat) => (
              <div
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`group cursor-pointer flex flex-col items-center transition-all duration-300 flex-shrink-0 snap-center min-w-[88px] ${
                  activeCategory === cat._id ? 'scale-110' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`relative w-20 h-20 mb-3 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  activeCategory === cat._id
                    ? 'border-primary-600 shadow-xl shadow-primary-500/20'
                    : 'border-transparent bg-gray-100 dark:bg-gray-800'
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className={`text-sm font-bold transition-colors ${
                  activeCategory === cat._id
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== شبكة المشاريع ===== */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">لا توجد مشاريع في هذه الفئة</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                onClick={() => setModalProject(project)}
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={Array.isArray(project.images) && project.images.length > 0 ? project.images[0] : ''}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">عرض التفاصيل</span>
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

      {/* Modal */}
      {modalProject && (
        <ProductDetailsModal
          project={modalProject}
          categories={categories}
          onClose={() => setModalProject(null)}
        />
      )}

    </section>
  );

}

export default Portfolio;