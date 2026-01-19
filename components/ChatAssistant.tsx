import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Send, Bot, User, Sparkles, Loader2, RefreshCw, PenTool, Box } from 'lucide-react';
import { ChatMessage } from '../types';

const EngineeringAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'أهلاً بك في مكتب المهندس خالد للاستشارات الهندسية وخدمات CNC! 📐 أنا مساعدك الذكي، كيف يمكنني مساعدتك اليوم في تصميم مشروعك أو اختيار الخامات المناسبة للحفر؟'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMountRef = useRef<boolean>(true);
  
  const chatSessionRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialMountRef.current) {
      initialMountRef.current = false;
      return;
    }
    scrollToBottom();
  }, [messages]);

  // Initialize Chat Session
  useEffect(() => {
    try {
      if (process.env.API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        chatSessionRef.current = ai.chats.create({
          model: 'gemini-3-flash-preview',
          config: {
            systemInstruction: `You are an expert technical assistant for "Engineer Khaled", a specialist in Design and CNC Machining services.
            Your goal is to help clients understand technical drawing (CAD/CAM), 2D/3D design, and CNC router/laser operations.
            Tone: Professional, Technical, Precise, and Helpful.
            Language: Arabic (Professional/Syrian context).
            Services provided: CNC Wood/Marble carving, 3D Modeling (AutoCAD, SolidWorks, Aspire), Interior design patterns, and Furniture design.
            Key info: We emphasize precision (zero tolerance), high-quality finish, and fast delivery.
            If asked about pricing: Mention that cost depends on "Design complexity", "Material type (Wood, Acrylic, Marble)", and "Machine time". Suggest sending the DXF/STL file for a final quote.
            Always refer to "Engineer Khaled's Team" or "We" when discussing services,
            phone number for contact: +20 11 43226557.`,
          },
        });
      }
    } catch (error) {
      console.error("Failed to initialize chat", error);
    }
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      if (!chatSessionRef.current) throw new Error("Chat not initialized");

      const response = await chatSessionRef.current.sendMessage({ message: userMsg });
      const text = response.text || "عذراً، لم أستطع فهم ذلك. هل يمكنك تزويدي بتفاصيل أكثر عن التصميم؟";
      
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.',
        isError: true 
      }]);
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
            <button onClick={() => setMessages([messages[0]])} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="استشارة جديدة">
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-[#0f172a]/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed text-sm md:text-base ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-dark-card text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm'
                } ${msg.isError ? 'bg-red-50 text-red-600' : ''}`}>
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
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white dark:bg-dark-card border-t border-gray-100 dark:border-gray-700">
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
                disabled={isLoading || !inputValue.trim()}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineeringAssistant;