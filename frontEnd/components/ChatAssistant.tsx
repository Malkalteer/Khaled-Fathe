import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bot, Loader2, RefreshCw, PenTool, Box } from 'lucide-react';
import { ChatMessage } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const WELCOME: ChatMessage = {
  role: 'model',
  text: 'أهلاً بك في مكتب المهندس خالد للاستشارات الهندسية وخدمات CNC! 📐 أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم في تصميم مشروعك أو اختيار الخامات المناسبة للحفر؟',
};

const EngineeringAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  // التمرير داخل صندوق المحادثة فقط (بدون تحريك الصفحة كلها)
  useEffect(() => {
    const el = bodyRef.current;
    if (el && messages.length > 1) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = inputValue.trim();
    if (!text || !user || isLoading) return;
    setInputValue('');
    const next: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setIsLoading(true);

    try {
      // المحادثة تمر عبر الخادم: مفتاح Gemini لا يصل إلى المتصفح أبداً
      const history = next.filter((m, i) => i > 0 && !m.isError).map(({ role, text }) => ({ role, text }));
      const { text: reply } = await api.chat(history);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: error instanceof Error ? error.message : 'عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.', isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <section id="chat" className="py-24 bg-slate-50 dark:bg-dark-bg transition-colors relative overflow-hidden">
        {/* Decorative elements - Engineering style */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-slate-200 dark:bg-slate-800/20 rounded-full blur-3xl opacity-50"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-1 rounded-full text-sm font-bold mb-4 border border-blue-200 dark:border-blue-800">
            <PenTool size={16} />
            <span>المساعد الهندسي الذكي</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
            استشارات التصميم و الـ CNC
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            تحدث مع مساعد المهندس خالد للحصول على تقديرات تقنية لمشاريع الحفر، النحت، والتصاميم الهندسية.
          </p>
        </div>

        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 h-[600px] flex flex-col">
          {/* Chat Header */}
          <div className="bg-slate-800 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Box size={24} />
              </div>
              <div>
                <h3 className="font-bold">مكتب المهندس خالد</h3>
                <div className="flex items-center gap-1 text-xs text-slate-300">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                  خبير التصميم متاح حالياً
                </div>
              </div>
            </div>
            <button onClick={() => setMessages([WELCOME])} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="استشارة جديدة">
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                }`}>
                  {msg.role === 'user' && user ? (
                    <span className="font-bold text-xs">{user.username.slice(0, 1)}</span>
                  ) : (
                    <Bot size={16} />
                  )}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed text-sm md:text-base ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
                } ${msg.isError ? '!bg-red-50 !text-red-600 dark:!bg-red-950/40' : ''} whitespace-pre-line`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white dark:bg-dark-card p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm">
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                  </div>
               </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-700">
            {user ? (
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="اسأل مثلاً: ما هي أفضل خامة لحفر لوغو بارز؟"
                  className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl py-4 pr-4 pl-14 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-transparent"
                  disabled={isLoading}
                />
                <button 
                  onClick={handleSend}
                  aria-label="إرسال"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Link to="/login" className="btn-primary">سجّل الدخول لبدء الاستشارة</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineeringAssistant;