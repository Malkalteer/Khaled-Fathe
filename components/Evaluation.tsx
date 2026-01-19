import React from 'react';

type Review = {
  name: string;
  location?: string;
  rating: number; // 0-5
  text: string;
};

const reviews: Review[] = [
  {
    name: 'أحمد علي',
    location: ' القاهرة',
    rating: 5,
    text: 'تجربة رائعة — الاهتمام بالتفاصيل وسرعة التسليم ونتيجة احترافية جداً.'
  },
  {
    name: 'سارة محمد',
    location: ' 6 اكتوبر',
    rating: 4,
    text: 'الخامات ممتازة والتواصل كان واضحاً. أنصح بالتعامل معهم.'
  },
  {
    name: 'محمود الحسن',
    location: 'الجيزة',
    rating: 5,
    text: 'عمل عالي الجودة ودقة متناهية في تنفيذ نقوش الـ CNC.'
  },
];

const StarFilled = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
  </svg>
);

const StarEmpty = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
  </svg>
);

const renderStars = (rating: number) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating ? <StarFilled key={i} /> : <StarEmpty key={i} />);
  }
  return <div className="flex items-center space-x-1 rtl:space-x-reverse text-yellow-400">{stars}</div>;
};

const Evaluation: React.FC = () => {
  const avg = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;

  return (
    <section id="evaluation" className="py-20 bg-gray-50 dark:bg-dark-bg transition-colors">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">تقييم العملاء</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">آراء حقيقية وتجارب نفذناها لعملائنا.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-4xl font-extrabold text-gray-900 dark:text-white">{avg}</div>
            <div>
              {renderStars(Math.round(avg))}
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-right">({reviews.length} مراجعات)</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, idx) => (
            <article key={idx} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-sm">{r.name.split(' ')[0].slice(0,1)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{r.name}</h4>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{r.location}</div>
                    </div>
                    <div>{renderStars(r.rating)}</div>
                  </div>
                  <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{r.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Evaluation;
