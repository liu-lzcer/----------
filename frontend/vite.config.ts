import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  // 环境变量由 .env/.env.* 提供，不在此处设置默认值
  return {
    appType: 'spa',
    server: {
      port: 5173,
      strictPort: true
    },
    preview: {
      port: 5173,
      strictPort: true
    }
  };
});


