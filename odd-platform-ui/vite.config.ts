import { defineConfig, loadEnv, type UserConfigExport } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import dns from 'dns';
import { cpus } from 'os';
import * as path from 'path';

dns.setDefaultResultOrder('verbatim');

function differElkjsSourcemapsPlugins() {
  const elkjsPackages = ['elkjs', 'elkjs/lib/elk.bundled', 'elkjs/lib/elk-api'];

  return {
    name: 'differ-elkjs-sourcemap',
    transform(code: string, id: string) {
      if (elkjsPackages.some(pkg => id.includes(pkg))) {
        return {
          code,
          map: null,
        };
      }
    },
  };
}

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

  const defaultPlugins = [react(), tsconfigPaths(), differElkjsSourcemapsPlugins()];

  const defaultConfig: UserConfigExport = {
    plugins: defaultPlugins,
    build: {
      outDir: 'build/ui',
      rollupOptions: {
        maxParallelFileOps: Math.max(1, cpus().length - 1),
        output: {
          manualChunks: id => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          sourcemapIgnoreList: relativeSourcePath => {
            const normalizedPath = path.normalize(relativeSourcePath);
            return normalizedPath.includes('node_modules');
          },
        },
        cache: false,
      },
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
