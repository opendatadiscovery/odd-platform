import { defineConfig, loadEnv, type UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const devServerConfig = {
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: process.env.VITE_DEV_PROXY,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };

  const defaultPlugins = [react(), tsconfigPaths()];

  const defaultConfig: UserConfigExport = {
    plugins: defaultPlugins,
    build: {
      outDir: 'build/ui',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
    },
  };

  return mode === 'development'
    ? {
        ...defaultConfig,
        ...(process.env.VITE_DEV_PROXY ? devServerConfig : {}),
        plugins: [
          checker({
            overlay: { initialIsOpen: false },
            typescript: true,
            eslint: { lintCommand: 'eslint --ext .tsx,.ts src/' },
          }),
          ...defaultPlugins,
        ],
      }
    : { ...defaultConfig };
});
