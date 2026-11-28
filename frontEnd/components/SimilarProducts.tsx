import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Project, categoryNameOf } from '../services/api';
import ProductCard from './ProductCard';

/** شريط أفقي قابل للتمرير بمنتجات من نفس الفئات */
const SimilarProducts: React.FC<{ products: Project[]; title?: string }> = ({ products, title = 'منتجات مشابهة' }) => {
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const update = () => {
    const el = row.current;
    if (!el) return;
    // في RTL تكون scrollLeft سالبة كلما تقدمنا نحو النهاية
    const pos = Math.abs(el.scrollLeft);
    setEdges({ start: pos < 8, end: pos + el.clientWidth >= el.scrollWidth - 8 });
  };

  useEffect(() => {
    update();
    const el = row.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [products]);

  if (products.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = row.current;
    if (el) el.scrollBy({ left: -dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section className="mt-12" aria-label={title}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
          <Layers size={20} className="text-primary-600" /> {title}
          <span className="text-sm font-normal text-gray-400">({products.length})</span>
        </h2>
        {products.length > 2 && (
          <div className="hidden gap-2 sm:flex">
            <button onClick={() => scrollBy(-1)} disabled={edges.start} className="btn-icon border border-gray-200 dark:border-gray-700" aria-label="السابق">
              <ChevronRight size={18} />
            </button>
            <button onClick={() => scrollBy(1)} disabled={edges.end} className="btn-icon border border-gray-200 dark:border-gray-700" aria-label="التالي">
              <ChevronLeft size={18} />
            </button>
          </div>
        )}
      </div>
      <div ref={row} className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4" style={{ scrollbarWidth: 'thin' }}>
        {products.map((p, i) => (
          <div key={p._id} className="w-[72%] shrink-0 snap-start sm:w-[280px]">
            <ProductCard project={p} index={i} categoryName={categoryNameOf(p)} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default SimilarProducts;
