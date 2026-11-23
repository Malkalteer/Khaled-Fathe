import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// لا توجد أي مفاتيح سرية هنا: كل ما يبدأ بـ VITE_ يصل إلى المتصفح،
// لذلك مفتاح Gemini يعيش في الخادم فقط (backEnd/.env).
export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
