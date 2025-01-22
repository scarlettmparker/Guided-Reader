import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import https from 'https';
import fs from 'fs';
import solidPlugin from 'vite-plugin-solid';
import tls from 'node:tls';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const certPath = env.VITE_CLIENT_CERT;
  const keyPath = env.VITE_CLIENT_KEY;
  const caPath = env.VITE_CLIENT_CA;

  const cert = fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined;
  const key = fs.existsSync(keyPath) ? fs.readFileSync(keyPath) : undefined;
  const ca = fs.existsSync(caPath) ? fs.readFileSync(caPath) : undefined;

  const create_https_agent = (rejectUnauthorized: boolean) => new https.Agent({
    cert: cert,
    key: key,
    ca: ca,
    ciphers: "AES256-GCM-SHA384",
    rejectUnauthorized,
    keepAlive: true,
    keepAliveMsecs: 1000,
    maxSockets: 50,
    maxCachedSessions: 100,
    sessionTimeout: 3600,
    secureContext: tls.createSecureContext({
      cert: cert,
      key: key,
      ca: ca,
      ticketKeys: tls.createSecureContext().context.getTicketKeys()
    })
  });

  const is_dev = env.VITE_SERVER_DEV === "true";
  const https_agent = cert && key && ca ? create_https_agent(!is_dev) : undefined;

  return {
    plugins: [solidPlugin()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      https: cert && key && ca ? {
        cert: cert,
        key: key,
        ca: ca,
      } : undefined,
      proxy: {
        '/api': {
          target: `${is_dev ? 'http' : 'https'}://${env.VITE_SERVER_HOST}:${env.VITE_SERVER_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          agent: https_agent,
        }
      },
      host: env.VITE_CLIENT_HOST,
      port: parseInt(env.VITE_CLIENT_PORT),
    },
    preview: {
      host: env.VITE_CLIENT_HOST,
      port: parseInt(env.VITE_CLIENT_PORT),
    },
    build: {
      target: 'esnext',
    },
  }
});