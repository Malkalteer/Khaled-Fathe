import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Portfolio from './components/Portfolio';
import ImageGenerator from './components/ImageGenerator';
import ChatAssistant from './components/ChatAssistant';
import Footer from './components/Footer';
import Evaluation from './components/Evaluation';
import { Theme } from './types';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReviewsAdmin from './components/ReviewsAdmin';
import AdminDashboard from './components/AdminDashboard';
import CategoryPage from './components/CategoryPage';
import { HelmetProvider } from 'react-helmet-async';
  // التحقق من الأدمن
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
import ReviewForm from './components/ReviewForm';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  // Default to Dark Mode
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  // Scroll to top عند تحميل الصفحة
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // ضبط الثيم عند التحميل
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(Theme.DARK);
    }
  }, []);

  // تطبيق الثيم على الـ document
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === Theme.DARK) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === Theme.DARK ? Theme.LIGHT : Theme.DARK));
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Hero />
        <Skills />
        <Portfolio />
        {/* <ImageGenerator /> */}
        <ChatAssistant />
        <Evaluation />
      </main>
      <Footer />
    </div>
  );

  return (
    <HelmetProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-review" element={<ReviewForm onSubmit={() => {}} />} />
        <Route path="/all-reviews" element={<ReviewsAdmin />} />
        <Route path="/portfolio/:categoryId" element={<CategoryPage />} />
        <Route path="/admin" element={isAdmin() ? <AdminDashboard /> : <div className="text-center mt-10 text-red-500">غير مصرح لك بالدخول</div>} />
      </Routes>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
