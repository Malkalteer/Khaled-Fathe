import React, { useEffect, useState } from 'react';
import { Moon, Sun, Menu, X, ShoppingCart, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Theme } from '../types';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [user, setUser] = useState<any | null>(null);
  const navigate = useNavigate();
  const { cart, setIsCartOpen } = useCart();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      setUser(null);
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'user') {
        setUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const refreshSession = async () => {
      const response = await fetch('https://khaled-fathe.onrender.com/api/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      }
    };
    refreshSession().catch(() => undefined);
    const timer = window.setInterval(() => refreshSession().catch(() => undefined), 14 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await fetch('https://khaled-fathe.onrender.com/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Define Navigation Items
  const navItems = [
    { label: 'الرئيسية', id: 'home' },
    { label: 'المهارات', id: 'skills' },
    { label: 'أعمالي', id: 'portfolio' },
    { label: 'الاستشارات', id: 'chat' },
  ];

  const handleScroll = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isAdmin = () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    try {
      const parsed = JSON.parse(user);
      return parsed.isAdmin === true;
    } catch {
      return false;
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
          KHF <span className="text-primary-500 text-sm ">DESIGNS</span>
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
          {isAdmin() && (
                <Link to="/admin" className="hidden md:inline-block text-sm bg-green-500 text-white px-3 py-1 rounded-md hover:opacity-90">إدارة</Link>
              )}
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

          <Link
            to="/favorites"
            className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-red-500 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
            aria-label="عرض المفضلة"
          >
            <Heart size={18} fill="currentColor" />
            <span className="text-xs font-bold">المفضلة</span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-primary-500 px-3 py-2 text-white shadow-sm hover:bg-primary-600 transition-colors"
            aria-label="فتح سلة الطلبات"
          >
            <ShoppingCart size={18} />
            <span className="text-xs font-bold">السلة</span>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-block text-sm text-gray-800 dark:text-gray-200">{user.username}</span>
              <button onClick={handleLogout} className="hidden md:inline-block text-sm bg-red-500 text-white px-3 py-1 rounded-md hover:opacity-90">خروج</button>
            </div>
          ) : (
            <>
              <Link to="/register" className="hidden md:inline-block text-sm text-primary-600 dark:text-primary-400 font-medium px-3 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">تسجيل</Link>
              <Link to="/login" className="hidden md:inline-block text-sm bg-primary-500 text-white px-3 py-1 rounded-md hover:opacity-90">دخول</Link>
              
            </>
          )}

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
            <div className="flex flex-col items-stretch pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
              {user ? (
                <>
                  <div className="text-right py-2 text-gray-800 dark:text-gray-200">{user.username}</div>
                  <button onClick={() => { setIsMenuOpen(false); handleLogout(); }} className="text-right bg-red-500 text-white py-2 rounded-md text-center">خروج</button>
                </>
              ) : (
                <>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-right text-primary-600 dark:text-primary-400 py-2">تسجيل</Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-right bg-primary-500 text-white py-2 rounded-md text-center">دخول</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;