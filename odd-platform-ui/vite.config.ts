/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite';
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

  const defaultConfig = {
    plugins: defaultPlugins,
    build: { outDir: 'build/ui' },
    test: {
      globals: true,
      environment: 'jsdom' as const,
      setupFiles: './src/setupTests.ts',
      // 20s, not vitest's 5s default. Cases that drive a real control through userEvent — a two-month calendar,
      // a dialog, a popover — measure 2-8s each on an 8-worker pool where every suite is importing MUI at once,
      // and at 5s ten of them time out on a warm machine (measured 2026-09-08: 258 passed / 10 timed out at the
      // head, 255 / 7 on main, every one green in isolation). A test that only passes when it runs alone is not a
      // gate; a hung test still fails, fifteen seconds later.
      testTimeout: 20_000,
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
            eslint: {
              lintCommand: 'eslint src/',
              useFlatConfig: true,
            },
          }),
          ...defaultPlugins,
        ],
      }
    : { ...defaultConfig };
});
