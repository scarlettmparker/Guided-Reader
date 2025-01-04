import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import https from 'https';
import fs from 'fs';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [solidPlugin()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      https: {
        key: fs.readFileSync('./src/key/client.key.pem'),
        cert: fs.readFileSync('./src/key/client.crt.pem'),
        ca: fs.readFileSync('./src/key/client.chain.crt.pem'),
      },
      proxy: {
        '/api': {
          target: `https://${env.VITE_SERVER_HOST}:${env.VITE_SERVER_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          
          // ... agent for client certificate authentication ...
          agent: new https.Agent({
            cert: fs.readFileSync('./src/key/client.crt.pem'),
            key: fs.readFileSync('./src/key/client.key.pem'),
            ca: fs.readFileSync('./src/key/client.chain.crt.pem'),
            rejectUnauthorized: env.VITE_SERVER_DEV != "true",
          }),
        }
      },
      port: 3000,
    },
    build: {
      target: 'esnext',
    },
  }
});