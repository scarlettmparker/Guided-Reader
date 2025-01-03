import path from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    https: {
      key: fs.readFileSync('./src/key/key.pem'),
      cert: fs.readFileSync('./src/key/cert.pem'),
      ca: fs.readFileSync('./server/key/ca-chain.pem'),
    },
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
