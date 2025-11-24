import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, '.', '');
  
  return {
    // 关键修复：GitHub Pages 通常部署在子目录，必须使用相对路径 './' 
    // 否则会找不到资源文件导致白屏
    base: './', 
    
    plugins: [react()],
    envDir: '.',
    define: {
      'process.env': {
        API_KEY: env.API_KEY || '',
        NODE_ENV: mode
      },
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});