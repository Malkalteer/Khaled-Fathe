import React from 'react';
import { Instagram, MapPin , Mail, Phone, Facebook } from 'lucide-react';


const Footer: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="scroll-mt-28 bg-gray-900 text-white py-12 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4">المهندس <span className="text-primary-500">خالد</span></h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              تصاميم استثنائية لحياة عصرية. نسعى دائماً لتحقيق التوازن بين الجمال والوظيفة في كل مساحة نلمسها.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/khaledbob29?igsh=bHI0cXcyYTB3b3gw&utm_source=qr" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="https://www.facebook.com/share/17yRgJ3aap/?mibextid=wwXIfr" target="_blank" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="https://wa.me/+201143226557" target="_blank" className="text-gray-400 hover:text-white transition-colors" aria-label="Custom social icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 50 500 640" className="w-7 h-7 fill-current" aria-hidden="true">
                  <path fill="currentColor" d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">روابط سريعة</h4>
            <ul className="space-y-2 text-gray-400">
              <li><button onClick={() => scrollToSection('home')} className="hover:text-primary-500 transition-colors bg-transparent border-none cursor-pointer">الرئيسية</button></li>
              <li><button onClick={() => scrollToSection('skills')} className="hover:text-primary-500 transition-colors bg-transparent border-none cursor-pointer">المهارات</button></li>
              <li><button onClick={() => scrollToSection('portfolio')} className="hover:text-primary-500 transition-colors bg-transparent border-none cursor-pointer">أعمالي</button></li>
              <li><button onClick={() => scrollToSection('ai-generator')} className="hover:text-primary-500 transition-colors bg-transparent border-none cursor-pointer">تخيل مساحتك</button></li>
              <li><button onClick={() => scrollToSection('chat')} className="hover:text-primary-500 transition-colors bg-transparent border-none cursor-pointer">الاستشارات</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-gray-200">تواصل معنا</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-primary-500" />
                <span dir="ltr">+20 114 3226557</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-primary-500" />
                <a href="https://wa.me/+201143226557" target="_blank"><span>Bob49885@gmail.com</span></a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-primary-500" />
                العنوان: القاهرة، مصر
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-gray-500 text-sm">
           المهندس خالد للتصميم الداخلي. جميع الحقوق محفوظة.&copy; {new Date().getFullYear()}
          <p> تصميم وتطوير بواسطة<a href="" style={{ color: '#007bff' }}> ALTEER</a> </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;