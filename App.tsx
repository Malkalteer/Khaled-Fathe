import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Skills from './components/Skills';
import Portfolio from './components/Portfolio';
import ImageGenerator from './components/ImageGenerator';
import ChatAssistant from './components/ChatAssistant';
import Footer from './components/Footer';
import { Theme } from './types';

function App() {
  // Default to Dark Mode as per requirements
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  useEffect(() => {
    // Check initial preference, but default to dark if not set
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(Theme.DARK);
    }
  }, []);

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
    setTheme(prev => prev === Theme.DARK ? Theme.LIGHT : Theme.DARK);
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
      </main>
      <Footer />
    </div>
  );
}

export default App;