import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.HIGH_VOLUME_PASSWORD': JSON.stringify(env.HIGH_VOLUME_PASSWORD || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@repo/core': path.resolve(__dirname, '../../packages/core/src'),
        '@repo/ui': path.resolve(__dirname, '../../packages/ui/src'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
