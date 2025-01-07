import { defineConfig, loadEnv } from 'vite';
import path from 'path';
import https from 'https';
import fs from 'fs';
import solidPlugin from 'vite-plugin-solid';
import tls from 'node:tls';

const cert = fs.readFileSync('./src/key/client.crt.pem');
const key = fs.readFileSync('./src/key/client.key.pem'); 
const ca = fs.readFileSync('./src/key/client.chain.crt.pem');

const ticket_keys = tls.createSecureContext().context.getTicketKeys();

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
    ticketKeys: ticket_keys
  })
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const https_agent = create_https_agent(env.VITE_SERVER_DEV !== "true");

  return {
    plugins: [solidPlugin()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      https: {
        cert: cert,
        key: key,
        ca: ca,
      },
      proxy: {
        '/api': {
          target: `https://${env.VITE_SERVER_HOST}:${env.VITE_SERVER_PORT}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          agent: https_agent,
        }
      },
      port: 3000,
    },
    build: {
      target: 'esnext',
    },
  }
});