import { defineConfig, loadEnv, UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import eslint from 'vite-plugin-eslint';

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const devServerConfig = {
    server: {
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
    build: { outDir: 'build/ui' },
  };

  return mode === 'development'
    ? {
        ...defaultConfig,
        ...devServerConfig,
        plugins: [eslint(), ...defaultPlugins],
      }
    : { ...defaultConfig };
});
