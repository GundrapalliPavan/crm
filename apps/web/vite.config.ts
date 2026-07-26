import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
// Imported from vitest so the config type includes the `test` block.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Config validation throws on a missing API base URL, so tests supply one
    // here rather than depending on a developer's local .env file.
    env: {
      VITE_API_BASE_URL: 'http://localhost:4000/api/v1',
    },
  },
});
