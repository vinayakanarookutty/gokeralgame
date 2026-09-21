import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    watch: {
      ignored: ['**/*.glb', '**/*.gltf', '**/*.fbx', '**/runner-in-gray/**', '**/*.bin', '**/*.apk', '**/android/**'],
    },
  },
});
