import React, { useState, useEffect } from 'react';
import img1 from '../img/img1-removebg-preview.png';
import img2 from '../img/img2-removebg-preview.png';
import img3 from '../img/ViewCapture20260510_193902.png';
import img4 from '../img/img4-removebg-preview.png';

import { Camera, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Slider Data - 4 complete slides
  const slides = [
    {
      id: 1,
      title: 'KHF Designs',
      subtitle: 'التصميم الهندسي الدقيق',
      description: 'رسومات هندسية دقيقة وتفصيلية باستخدام أحدث التقنيات',
      badge: '10 سنوات خبرة',
      image: img1,
      buttonText1: 'تواصل معنا',
      buttonText2: 'أعمالي',
    },
    {
      id: 2,
      title: 'الجودة العالية',
      subtitle: 'معايير صناعية عالمية',
      description: 'نلتزم بأعلى معايير الجودة في كل مشروع',
      badge: '+500 مشروع',
      image: img2,
      buttonText1: 'شاهد الأعمال',
      buttonText2: 'اتصل بنا',
    },
    {
      id: 3,
      title: 'الدقة والإتقان',
      subtitle: 'كل تفصيل مهم',
      description: 'نهتم بأصغر التفاصيل لتحقيق النتيجة المثالية',
      badge: '100% رضا العملاء',
      image: img3,
      buttonText1: 'استكشف المزيد',
      buttonText2: 'تعرف علينا',
    },
    {
      id: 4,
      title: 'الابتكار المستمر',
      subtitle: 'تقنيات حديثة ومتطورة',
      description: 'نستخدم أحدث برامج وتقنيات التصميم الهندسي',
      badge: 'أحدث البرامج',
      image: img4,
      buttonText1: 'اطلب عرض',
      buttonText2: 'زر معرض الأعمال',
    },
  ];

  // Reset auto-play timer
  const resetAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      setDirection('right');
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
  };

  // Auto-play slider
  useEffect(() => {
    resetAutoPlay();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 'right' : 'left');
    setCurrentSlide(index);
    resetAutoPlay();
  };

  const nextSlide = () => {
    setDirection('right');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    resetAutoPlay();
  };

  const prevSlide = () => {
    setDirection('left');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    resetAutoPlay();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const slide = slides[currentSlide];

return (
  <section
    id="home"
    className="relative min-h-[100svh] lg:h-screen overflow-hidden scroll-mt-28 flex items-center"
  >
    <style>{`
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(40px) scale(.98);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-40px) scale(.98);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }

      .slide-content-enter {
        animation: slideIn .6s ease-out;
      }

      .slide-content-enter-left {
        animation: slideInLeft .6s ease-out;
      }
    `}</style>

    {/* Background */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-500/20 blur-3xl" />
    </div>

    <div className="container mx-auto px-4 sm:px-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[100svh] lg:min-h-screen py-16 sm:py-20 lg:py-24">

        {/* CONTENT */}
        <div
          key={`content-${currentSlide}`}
          className={`order-1 lg:order-1 sm:order-2 text-center lg:text-right ${
            direction === 'right'
              ? 'slide-content-enter'
              : 'slide-content-enter-left'
          }`}
        >
          <div className="max-w-xl lg:max-w-2xl mx-auto lg:mx-0">

            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 font-semibold mb-4 sm:mb-6 text-sm sm:text-base">
              <Camera size={16} className="sm:hidden" />
              <Camera size={18} className="hidden sm:block" />
              {slide.badge}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              {slide.title}
            </h1>

            <p className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl text-primary-500 font-semibold">
              {slide.subtitle}
            </p>

            <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {slide.description}
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mt-8 sm:mt-10">
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-primary-500/30 active:scale-95"
              >
                {slide.buttonText1}
              </button>

              <button
                onClick={() => scrollToSection('portfolio')}
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white rounded-full font-semibold transition-all active:scale-95"
              >
                {slide.buttonText2}
              </button>
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div
          key={`image-${currentSlide}`}
          className={` lg:order-2 sm:order-1  ${
            direction === 'right'
              ? 'slide-content-enter'
              : 'slide-content-enter-left'
          }`}
        >
          <div className="relative mx-auto w-full max-w-[560px]">

            <div className="relative overflow-hidden rounded-[32px] border border-white/20 dark:border-gray-700 shadow-2xl">

              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-[260px] sm:h-[320px] md:h-[500px] object-contain transition duration-700 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

              <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-lg">
                <p className="text-[10px] sm:text-xs text-gray-500">
                  الحالية
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                  {slide.badge}
                </p>
              </div>

              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-2 sm:p-3 rounded-full shadow-lg hover:bg-primary-500 hover:text-white transition-all"
              >
                <ChevronLeft size={18} className="sm:hidden" />
                <ChevronLeft size={22} className="hidden sm:block" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-2 sm:p-3 rounded-full shadow-lg hover:bg-primary-500 hover:text-white transition-all"
              >
                <ChevronRight size={18} className="sm:hidden" />
                <ChevronRight size={22} className="hidden sm:block" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 sm:mt-6">
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all duration-500"
                  style={{
                    width: `${((currentSlide + 1) / slides.length) * 100}%`,}}
                />
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-5">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    currentSlide === index
                      ? 'w-6 sm:w-8 h-2 bg-primary-600'
                      : 'w-2 h-2 bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>

    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400">
      <ArrowDown size={28} className="animate-bounce" />
    </div>
  </section>
);
};
export default Hero;