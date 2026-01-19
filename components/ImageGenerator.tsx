import React, { useState } from 'react';
import { Wand2, Loader2, Image as ImageIcon } from 'lucide-react';
import { generateInteriorImage } from '../services/gemini';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageBase64 = await generateInteriorImage(prompt);
      if (imageBase64) {
        setGeneratedImage(imageBase64);
      } else {
        setError("لم يتم توليد الصورة، حاول وصفاً آخر.");
      }
    } catch (err) {
      setError("حدث خطأ أثناء التويد. يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ai-generator" className="scroll-mt-28 py-20 bg-gray-50 dark:bg-dark-bg transition-colors duration-300 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          
          {/* Input Side */}
          <div className="flex-1 w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
              <Wand2 className="text-primary-500" size={36} />
              تخيل مساحتك
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              استخدم الذكاء الاصطناعي لتوليد أفكار أولية لتصميم غرفتك. صف لي ما يدور في مخيلتك وسأقوم برسمه لك.
            </p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف التصميم
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="مثال: غرفة معيشة مودرن بألوان بيج وأزرق، مع نافذة كبيرة وإضاءة دافئة..."
                className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white"
              />
              
              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className={`mt-4 w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  loading || !prompt.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:shadow-lg hover:scale-[1.01]'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" /> جاري التوليد...
                  </>
                ) : (
                  <>
                    <Wand2 size={20} /> توليد التصميم
                  </>
                )}
              </button>
              
              {error && (
                <p className="mt-4 text-red-500 text-sm text-center">{error}</p>
              )}
            </div>
          </div>

          {/* Output Side */}
          <div className="flex-1 w-full flex justify-center">
            <div className="relative w-full max-w-xl aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-600 flex items-center justify-center">
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated Interior" 
                  className="w-full h-full object-cover animate-fade-in"
                />
              ) : (
                <div className="text-center text-gray-400 dark:text-gray-500 p-8">
                  {loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <p>جاري رسم أفكارك...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={64} className="opacity-50" />
                      <p>ستظهر الصورة هنا</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ImageGenerator;