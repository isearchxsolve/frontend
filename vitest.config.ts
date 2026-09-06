import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    testTimeout: 30000,
    hookTimeout: 10000,
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    css: false,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});