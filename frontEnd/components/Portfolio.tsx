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
                alt={project.title + ' صورة ' + (idx+1)}
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

        {/* Filter Buttons (Image-based) */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`group cursor-pointer flex flex-col items-center transition-all duration-300 ${
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
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-3 text-center py-12">جاري التحميل...</div>
          ) : filteredProjects.map((project) => {
            let cat = null;
            if (project.category && typeof project.category === 'object' && (project.category as Category)._id) {
              cat = categories.find(c => c._id === (project.category as Category)._id);
            } else {
              cat = categories.find(c => c._id === project.category);
            }
            return (
              <div 
                key={project._id} 
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={Array.isArray(project.images) && project.images.length > 0 ? project.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={project.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white bg-primary-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {cat ? cat.name : ',allk'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                    {project.title}
                  </h3>
                  <div className="flex w-full justify-end">
                    <button className="text-primary-500 hover:text-primary-600 p-2 rounded-full hover:bg-white hover:text-black bg-primary-50 dark:bg-gray-900 dark:hover:bg-gray-700 transition-colors ">
                      <a href="#" onClick={e => { e.preventDefault(); setModalProject(project); }}>
                        اقرأ المزيد من التفاصيل
                      </a>
                    </button>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      الفئة: {cat ? cat.name : 'غير محدد'}
                    </span>
                    {/* Modal for project details */}
                    {modalProject && (
                      <ProductDetailsModal
                        project={modalProject}
                        categories={categories}
                        onClose={() => setModalProject(null)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {!loading && filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            لا توجد مشاريع في هذا القسم حالياً.
          </div>
        )}
      </div>
    </section>
  );

}

export default Portfolio;