// vitest.config.js
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
    alias: {
      api: path.resolve(__dirname, './src/api'),
      constants: path.resolve(__dirname, './src/constants'),
      assets: path.resolve(__dirname, './src/assets'),
    },
  },
});
