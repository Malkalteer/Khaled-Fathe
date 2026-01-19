import React from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Define Navigation Items
  const navItems = [
    { label: 'الرئيسية', id: 'home' },
    { label: 'المهارات', id: 'skills' },
    { label: 'أعمالي', id: 'portfolio' },
    { label: 'تخيل مساحتك', id: 'ai-generator' },
    { label: 'الاستشارات', id: 'chat' },
  ];

  const handleScroll = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <div 
          onClick={() => handleScroll('home')}
          className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer"
        >
          خالد <span className="text-primary-500 text-sm align-top">DESIGNS</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navItems.map((item, idx) => (
             <button 
              key={idx}
              onClick={() => handleScroll(item.id)}
              className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-500 font-medium transition-colors text-sm lg:text-base bg-transparent border-none cursor-pointer"
             >
               {item.label}
             </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === Theme.DARK ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button 
            className="md:hidden text-gray-800 dark:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-800 py-4 px-6 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item, idx) => (
               <button 
                key={idx}
                onClick={() => handleScroll(item.id)}
                className="text-right text-gray-700 dark:text-gray-300 hover:text-primary-500 font-medium py-2 bg-transparent border-none cursor-pointer"
               >
                 {item.label}
               </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;