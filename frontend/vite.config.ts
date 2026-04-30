import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(() => {
  const {
    VITE_HMR_HOST,
    VITE_HMR_PROTOCOL,
    VITE_HMR_PORT,
  } = process.env;

  const trimmedHost = VITE_HMR_HOST?.trim();

  const hmrConfig = trimmedHost
    ? {
        host: trimmedHost,
        protocol: (VITE_HMR_PROTOCOL ?? 'wss').trim(),
        ...(VITE_HMR_PORT ? { port: Number(VITE_HMR_PORT) } : {}),
      }
    : undefined;

  const allowedHosts = [
    'test.digistoretg.ir',
    ...(trimmedHost ? [trimmedHost] : []),
  ];

  return {
    plugins: [react()],
    resolve: {
      alias: {
        'vaul@1.1.2': 'vaul',
        'sonner@2.0.3': 'sonner',
        'recharts@2.15.2': 'recharts',
        'react-resizable-panels@2.1.7': 'react-resizable-panels',
        'react-hook-form@7.55.0': 'react-hook-form',
        'react-day-picker@8.10.1': 'react-day-picker',
        'next-themes@0.4.6': 'next-themes',
        'lucide-react@0.487.0': 'lucide-react',
        'input-otp@1.4.2': 'input-otp',
        'figma:asset/3c84fcd91e158bf8a94b8f810214baafc058d37b.png': path.resolve(
          __dirname,
          './src/assets/3c84fcd91e158bf8a94b8f810214baafc058d37b.png',
        ),
        'embla-carousel-react@8.6.0': 'embla-carousel-react',
        'cmdk@1.1.1': 'cmdk',
        'class-variance-authority@0.7.1': 'class-variance-authority',
        '@radix-ui/react-tooltip@1.1.8': '@radix-ui/react-tooltip',
        '@radix-ui/react-toggle@1.1.2': '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group@1.1.2': '@radix-ui/react-toggle-group',
        '@radix-ui/react-tabs@1.1.3': '@radix-ui/react-tabs',
        '@radix-ui/react-switch@1.1.3': '@radix-ui/react-switch',
        '@radix-ui/react-slot@1.1.2': '@radix-ui/react-slot',
        '@radix-ui/react-slider@1.2.3': '@radix-ui/react-slider',
        '@radix-ui/react-separator@1.1.2': '@radix-ui/react-separator',
        '@radix-ui/react-select@2.1.6': '@radix-ui/react-select',
        '@radix-ui/react-scroll-area@1.2.3': '@radix-ui/react-scroll-area',
        '@radix-ui/react-radio-group@1.2.3': '@radix-ui/react-radio-group',
        '@radix-ui/react-progress@1.1.2': '@radix-ui/react-progress',
        '@radix-ui/react-popover@1.1.6': '@radix-ui/react-popover',
        '@radix-ui/react-navigation-menu@1.2.5': '@radix-ui/react-navigation-menu',
        '@radix-ui/react-menubar@1.1.6': '@radix-ui/react-menubar',
        '@radix-ui/react-label@2.1.2': '@radix-ui/react-label',
        '@radix-ui/react-hover-card@1.1.6': '@radix-ui/react-hover-card',
        '@radix-ui/react-dropdown-menu@2.1.6': '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-dialog@1.1.6': '@radix-ui/react-dialog',
        '@radix-ui/react-context-menu@2.2.6': '@radix-ui/react-context-menu',
        '@radix-ui/react-collapsible@1.1.3': '@radix-ui/react-collapsible',
        '@radix-ui/react-checkbox@1.1.4': '@radix-ui/react-checkbox',
        '@radix-ui/react-avatar@1.1.3': '@radix-ui/react-avatar',
        '@radix-ui/react-aspect-ratio@1.1.2': '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-alert-dialog@1.1.6': '@radix-ui/react-alert-dialog',
        '@radix-ui/react-accordion@1.2.3': '@radix-ui/react-accordion',
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-slot', 'lucide-react', 'sonner', 'vaul'],
            utils: ['i18next', 'react-i18next', 'crypto-js', 'react-day-picker']
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: false,
      proxy: {
        '/api/proxy': {
          target: 'https://naturrregenius.ir',
          changeOrigin: true,
          secure: false, // Updated to bypass SSL issues if any
          rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
        },
      },
      ...(hmrConfig ? { hmr: hmrConfig } : {}),
      ...(allowedHosts.length ? { allowedHosts } : {}),
      watch: {
        usePolling: true,
      },
    },
  };
});
