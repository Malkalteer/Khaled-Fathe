import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // استيراد النافيتور للتنقل بين المسارات
import { Layers } from 'lucide-react';
import { api, Category, Project } from '../services/api';

const Portfolio: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // دالة مساعدة للتحقق من تطابق الفئة للمشروع
  const isProjectInCategory = (project: Project, categoryId: string) => {
    if (!project.category) return false;
    if (typeof project.category === 'object' && project.category._id) {
      return project.category._id === categoryId;
    }
    return project.category === categoryId;
  };

// فرز المشاريع بناءً على الـ _id لضمان أن الأحدث (الأكبر قيمة) يكون في البداية دائماً
const sortedProjects = [...projects].sort((a, b) => b._id.localeCompare(a._id));

// التقاط المنتج الأحدث لكل فئة
const mainPageProjects = categories.map(cat => {
  return sortedProjects.find(project => isProjectInCategory(project, cat._id));
}).filter((p): p is Project => p !== undefined);

  // دالة الانتقال للمسار الجديد عند الضغط على الكاتيجوري
  const handleCategoryClick = (categoryId: string) => {
    navigate(`/portfolio/${categoryId}`);
  };

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
            جولة في أحدث مشاريعنا الهندسية. اضغط على أي فئة للانتقال لصفحة المنتجات الخاصة بها.
          </p>
        </div>

        {/* ===== قسم الفئات المفلترة العلوية ===== */}
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
                onClick={() => handleCategoryClick(cat._id)}
                className="group cursor-pointer flex flex-col items-center transition-all duration-300 flex-shrink-0 snap-center min-w-[88px] opacity-80 hover:opacity-100 hover:scale-105"
              >
                <div className="relative w-20 h-20 mb-3 rounded-2xl overflow-hidden border-2 border-transparent bg-gray-100 dark:bg-gray-800 group-hover:border-primary-600 transition-all duration-300">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== شبكة المشاريع (منتج ممثل واحد لكل فئة) ===== */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : mainPageProjects.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-lg">لا توجد مشاريع متاحة حالياً</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainPageProjects.map((project) => {
              const projectCat = categories.find(c => isProjectInCategory(project, c._id));
              return (
                <div
                  key={project._id}
                  className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div
                      onClick={() => projectCat && handleCategoryClick(projectCat._id)}
                      className="relative overflow-hidden aspect-[4/3] cursor-pointer"
                    >
                      <img
                        src={Array.isArray(project.images) && project.images.length > 0 ? project.images[0] : ''}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl transform -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          عرض مشاريع القسم
                        </button>
                      </div>
                    </div>
                    <div className="p-5">
                      {projectCat && (
                        <span
                          onClick={() => handleCategoryClick(projectCat._id)}
                          className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-md mb-2 font-medium cursor-pointer hover:text-primary-600"
                        >
                          فئة: {projectCat.name}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{project.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
                    </div>
                  </div>

                  {projectCat && (
                    <div className="px-5 pb-5">
                      <button
                        onClick={() => handleCategoryClick(projectCat._id)}
                        className="w-full text-center text-sm font-semibold text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-950/50 hover:bg-primary-600 hover:text-white py-2 rounded-xl transition duration-300"
                      >
                        عرض كافة مشاريع {projectCat.name}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default Portfolio;