import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Portfolio from './components/Portfolio';
import ChatAssistant from './components/ChatAssistant';
import Footer from './components/Footer';
import Evaluation from './components/Evaluation';
import { CartDrawer } from './components/CartDrawer';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/Dialog';

import { Theme } from './types';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// الصفحات الثانوية تُحمَّل عند الحاجة فقط لتسريع الصفحة الرئيسية
const CategoryPage = lazy(() => import('./components/CategoryPage'));
const ProductPage = lazy(() => import('./components/ProductPage'));
const QuotePage = lazy(() => import('./components/QuotePage'));
const ReviewForm = lazy(() => import('./components/ReviewForm'));
const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const FavoritesPage = lazy(() => import('./components/FavoritesPage'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

interface ThemeProps {
  theme: Theme;
  toggleTheme: () => void;
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
    <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

/** يمرر الصفحة إلى القسم المطلوب عند فتح رابط مثل /#evaluation */
const ScrollToHash: React.FC = () => {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 150);
    return () => window.clearTimeout(timer);
  }, [hash, pathname]);
  return null;
};

const HomePage: React.FC<ThemeProps> = ({ theme, toggleTheme }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
    <Header theme={theme} toggleTheme={toggleTheme} />
    <main>
      <Hero />
      <Skills />
      <Portfolio />
      <ChatAssistant />
      <Evaluation />
    </main>
    <Footer />
  </div>
);

/** حماية واجهة فقط — الحماية الحقيقية في الخادم (requireAdmin) */
const AdminRoute: React.FC<ThemeProps> = (props) => {
  const { user, isAdmin, checking } = useAuth();
  if (checking && !user) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-dark-bg text-center" dir="rtl">
        <p className="text-xl font-bold text-red-500">غير مصرح لك بالدخول إلى لوحة التحكم</p>
        <a href="/" className="btn-secondary">العودة للرئيسية</a>
      </div>
    );
  }
  return <AdminDashboard {...props} />;
};

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return (localStorage.getItem('theme') as Theme) || Theme.DARK;
    } catch {
      return Theme.DARK;
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === Theme.DARK);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK));
  const themeProps = { theme, toggleTheme };

  return (
    <HelmetProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>
                <ScrollToHash />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage {...themeProps} />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/add-review" element={<ReviewForm />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/quote" element={<QuotePage />} />
                    <Route path="/portfolio/:categoryId" element={<CategoryPage />} />
                    <Route path="/project/:id" element={<ProductPage />} />
                    <Route path="/admin/*" element={<AdminRoute {...themeProps} />} />
                    <Route path="/all-reviews" element={<Navigate to="/admin/reviews" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
                <CartDrawer />
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </HelmetProvider>
  );
}

export default App;
