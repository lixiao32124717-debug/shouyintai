import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react()],
    // 明确指定环境目录
    envDir: '.',
    define: {
      // 关键修复：注入 process.env 对象，防止 "ReferenceError: process is not defined"
      'process.env': {
        API_KEY: env.API_KEY || '',
        NODE_ENV: mode
      },
      // 显式注入 API_KEY，确保优先级
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});