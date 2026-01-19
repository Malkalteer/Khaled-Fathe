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

  return (
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
}

export default App;
