import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Project } from '../services/api';
import { useCart } from '../context/CartContext';
import { ProductRating } from './ProductRating';
import { formatPrice } from '../lib/format';

interface Props {
  project: Project;
  categoryName?: string;
  index?: number;
  footer?: React.ReactNode;
}

const ProductCard: React.FC<Props> = ({ project, categoryName, index = 0, footer }) => {
  const { addToCart } = useCart();
  const image = project.images?.[0] || '';
  const url = `/project/${project._id}`;
  const item = { _id: project._id, title: project.title, code: project.code, image, category: categoryName, price: project.price, averageRating: project.averageRating };
  const hasPrice = Number(project.price) > 0;

  return (
    <article
      className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col animate-card-in"
      style={{ animationDelay: `${Math.min(index * 80, 480)}ms` }}
    >
      <Link to={url} className="relative block overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-gray-800" aria-label={`عرض تفاصيل ${project.title}`}>
        {image && (
          <img src={image} alt={project.title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        )}
        {project.bestSeller && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow">
            <Flame size={13} /> الأكثر مبيعاً
          </span>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            عرض التفاصيل
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        <div className="mb-2 flex items-center justify-between gap-2">
          {categoryName ? (
            <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-md font-medium">{categoryName}</span>
          ) : <span />}
          {project.code && <span className="text-[11px] font-mono text-gray-400" dir="ltr">#{project.code}</span>}
        </div>
        <Link to={url}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 hover:text-primary-600 transition-colors">{project.title}</h3>
        </Link>
        <div className={`text-xl font-black ${hasPrice ? 'text-gray-900 dark:text-white' : 'text-base font-bold text-gray-500 dark:text-gray-400'}`}>
          {formatPrice(project.price)}
        </div>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
        <ProductRating productId={project._id} compact initial={project} />

        <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => addToCart(item)}
            className="flex items-center justify-center gap-1.5 border border-primary-600 text-primary-600 dark:text-primary-400 text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/40 transition"
          >
            <ShoppingCart size={16} /> أضف للسلة
          </button>
          <button
            onClick={() => addToCart(item, { open: true })}
            className="flex items-center justify-center gap-1.5 bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-700 transition"
          >
            <ShoppingBag size={16} /> شراء
          </button>
        </div>
        {footer}
      </div>
    </article>
  );
};

export default ProductCard;
