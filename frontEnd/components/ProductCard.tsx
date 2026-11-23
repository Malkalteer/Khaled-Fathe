import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { Project } from '../services/api';
import { useCart } from '../context/CartContext';
import { ProductRating } from './ProductRating';
import { quoteMessageForProduct, whatsappLink } from '../lib/whatsapp';

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

  return (
    <article
      className="bg-white dark:bg-dark-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col animate-card-in"
      style={{ animationDelay: `${Math.min(index * 80, 480)}ms` }}
    >
      <Link to={url} className="relative block overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800" aria-label={`عرض تفاصيل ${project.title}`}>
        {image && (
          <img
            src={image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3 px-6 rounded-xl -translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            عرض التفاصيل
          </span>
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {categoryName && (
          <span className="inline-block self-start bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs px-2.5 py-1 rounded-md mb-2 font-medium">
            {categoryName}
          </span>
        )}
        <Link to={url}>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 hover:text-primary-600 transition-colors">{project.title}</h3>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
        <ProductRating productId={project._id} compact initial={project} />

        <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => addToCart({ _id: project._id, title: project.title, image, category: categoryName, averageRating: project.averageRating })}
            className="flex items-center justify-center gap-1.5 bg-primary-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-primary-700 transition"
          >
            <ShoppingCart size={16} /> أضف للسلة
          </button>
          <a
            href={whatsappLink(quoteMessageForProduct({ ...project, categoryName }))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-green-700 transition"
          >
            <MessageCircle size={16} /> اطلب عرض سعر
          </a>
        </div>
        {footer}
      </div>
    </article>
  );
};

export default ProductCard;
