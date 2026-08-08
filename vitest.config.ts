import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/components/*': path.resolve(__dirname, './src/components/*'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/lib/*': path.resolve(__dirname, './src/lib/*'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/hooks/*': path.resolve(__dirname, './src/hooks/*'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/stores/*': path.resolve(__dirname, './src/stores/*'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/styles/*': path.resolve(__dirname, './src/styles/*'),
    },
  },
});
