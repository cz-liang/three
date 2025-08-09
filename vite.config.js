import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(() => {
  return {
    base: '/three/', // 本地运行dist，使用‘’，部署到gh-pages,使用‘/three/’
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'), // 这样才能支持 @/pages/xxx
      },
    },
  };
});
