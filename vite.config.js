/**
 * @type {import('vite').UserConfig}
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/three/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // 这样才能支持 @/pages/xxx
    },
  },
});
