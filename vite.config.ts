import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, '.', '');
  
  return {
    // 必须使用 './' 相对路径，否则在 GitHub 子目录中会找不到资源
    base: './', 
    
    plugins: [react()],
    envDir: '.',
    // 静态资源目录配置
    publicDir: 'public',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    },
    define: {
      'process.env': {
        API_KEY: env.API_KEY || '',
        NODE_ENV: mode
      },
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});