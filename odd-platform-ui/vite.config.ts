import {
  defineConfig,
  loadEnv,
  type UserConfigExport,
  // splitVendorChunkPlugin,
  // type Plugin,
  // type PluginOption,
} from 'vite';
import react from '@vitejs/plugin-react';
// import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';
import checker from 'vite-plugin-checker';
import dns from 'dns';
// import * as path from 'path';
// import { cpus } from 'os';

dns.setDefaultResultOrder('verbatim');

// interface SourcemapExclude {
//   excludeNodeModules?: boolean;
// }
//
// function sourcemapExclude(opts?: SourcemapExclude): Plugin {
//   return {
//     name: 'sourcemap-exclude',
//     transform(code: string, id: string) {
//       if (opts?.excludeNodeModules && id.includes('node_modules')) {
//         return {
//           code,
//           // https://github.com/rollup/rollup/blob/master/docs/plugin-development/index.md#source-code-transformations
//           map: null,
//         };
//       }
//     },
//   };
// }

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

  const defaultPlugins = [
    react(),
    tsconfigPaths(),
    // sourcemapExclude({ excludeNodeModules: true }),
    // splitVendorChunkPlugin(),
    // visualizer({ open: true }) as PluginOption,
  ];

  const defaultConfig: UserConfigExport = {
    plugins: defaultPlugins,
    build: {
      outDir: 'build/ui',
      // sourcemap: false,
      // commonjsOptions: {
      //   sourceMap: false,
      // },
      // rollupOptions: {
      //   // maxParallelFileOps: Math.max(1, cpus().length - 1),
      //   output: {
      //     manualChunks: {
      //       jsoneditor: ['vanilla-jsoneditor'],
      //       elkjs: ['elkjs'],
      //       elkjsBundled: ['elkjs/lib/elk.bundled'],
      //     },
      //     // manualChunks: id => {
      //     //   if (id.includes('node_modules')) {
      //     //     return 'vendor';
      //     //   }
      //     // },
      //     sourcemapIgnoreList: relativeSourcePath => {
      //       const normalizedPath = path.normalize(relativeSourcePath);
      //       return normalizedPath.includes('node_modules');
      //     },
      //     sourcemap: false,
      //   },
      //   cache: false,
      // },
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
