import React from 'react';
import logo from '../img/logo-removebg-preview.png';
import { Camera, ArrowDown } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="scroll-mt-28 min-h-screen flex items-center justify-center pt-20 pb-10 px-6">
      <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-12">
        
        <div className="flex-1 relative md:order-1 flex justify-end">
          <div className="relative w-full max-w-md aspect-square">
            <div className="absolute inset-0 bg-primary-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <img 
              src={logo}
              alt="المهندس خالد" 
              className="relative w-full h-full object-cover rounded-[2rem] border-0 border-white  z-10 transform hover:scale-[1.02] transition-transform duration-500"
            />
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl flex items-center gap-3 z-20 border border-gray-100 dark:border-gray-700">
              <div className="bg-primary-100 dark:bg-primary-900 p-2 rounded-full text-primary-600">
                <Camera size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">خبرة أكثر من</p>
                <p className="font-bold text-gray-900 dark:text-white">10 سنوات</p>
              </div>
            </div>
          </div>
        </div>{/* Right Side (Image) */}
        {/* Left Side (Text) */}
        <div className="flex-1 text-left md:text-right space-y-6 md:order-2">
          <div className="flex flex-col items-end md:items-start text-right md:text-left rtl:md:text-right rtl:items-start">
             <h2 className="text-xl font-semibold text-primary-500 mb-2">مرحباً بكم في عالمي</h2>
             <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-gray-900 dark:text-white">
               المهندس <span className="text-primary-500">خالد</span>
               <br />
               للتصميم و الCNC
             </h1>
             <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
               نحول مساحتك إلى تحفة فنية تعكس شخصيتك. دمج بين الأناقة العصرية والراحة الوظيفية لخلق بيئة تلهمك كل يوم.
             </p>
             
             <div className="flex gap-4">
               <button 
                 onClick={() => scrollToSection('contact')}
                 className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-primary-500/30 cursor-pointer"
               >
                 تواصل معنا
               </button>
               <button 
                 onClick={() => scrollToSection('portfolio')}
                 className="px-8 py-3 border border-gray-300 dark:border-gray-600 hover:border-primary-500 text-gray-700 dark:text-gray-200 rounded-full font-semibold transition-all cursor-pointer"
               >
                 أعمالي
               </button>
             </div>
          </div>
        </div>{/* Left Side (Text) */}

        {/* Right Side (Image) */}
        
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce text-gray-400 dark:text-gray-600">
        <ArrowDown size={32} />
      </div>
    </section>
  );
};

export default Hero;