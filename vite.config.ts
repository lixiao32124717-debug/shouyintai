import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // 使得代码中的 process.env.API_KEY 在构建时能被替换为实际的值
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});