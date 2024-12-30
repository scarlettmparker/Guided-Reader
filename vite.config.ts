import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    include: ["micromark", "unified"]
  },
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
