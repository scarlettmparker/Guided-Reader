var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/scarw/Documents/GitHub/Guided-Reader/node_modules/vite/dist/node/index.js";
import path from "path";
import https from "https";
import fs from "fs";
import solidPlugin from "file:///C:/Users/scarw/Documents/GitHub/Guided-Reader/node_modules/vite-plugin-solid/dist/esm/index.mjs";
var __vite_injected_original_dirname = "C:\\Users\\scarw\\Documents\\GitHub\\Guided-Reader";
var cert = fs.readFileSync("./src/key/client.crt.pem");
var key = fs.readFileSync("./src/key/client.key.pem");
var ca = fs.readFileSync("./src/key/client.chain.crt.pem");
var create_https_agent = (rejectUnauthorized) => new https.Agent({
  cert,
  key,
  ca,
  ciphers: "AES256-GCM-SHA384",
  rejectUnauthorized,
  keepAlive: true,
  keepAliveMsecs: 1e3,
  maxSockets: 50,
  sessionTimeout: 60,
  secureOptions: __require("constants").SSL_OP_NO_TLSv1 | __require("constants").SSL_OP_NO_TLSv1_1,
  enableTrace: true
});
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const https_agent = create_https_agent(env.VITE_SERVER_DEV == "true");
  return {
    plugins: [solidPlugin()],
    resolve: {
      alias: {
        "~": path.resolve(__vite_injected_original_dirname, "src")
      }
    },
    server: {
      https: {
        cert,
        key,
        ca
      },
      proxy: {
        "/api": {
          target: `https://${env.VITE_SERVER_HOST}:${env.VITE_SERVER_PORT}`,
          changeOrigin: true,
          rewrite: (path2) => path2.replace(/^\/api/, ""),
          agent: https_agent
        }
      },
      port: 3e3
    },
    build: {
      target: "esnext"
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxzY2Fyd1xcXFxEb2N1bWVudHNcXFxcR2l0SHViXFxcXEd1aWRlZC1SZWFkZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXHNjYXJ3XFxcXERvY3VtZW50c1xcXFxHaXRIdWJcXFxcR3VpZGVkLVJlYWRlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvc2NhcncvRG9jdW1lbnRzL0dpdEh1Yi9HdWlkZWQtUmVhZGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBodHRwcyBmcm9tICdodHRwcyc7XG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHNvbGlkUGx1Z2luIGZyb20gJ3ZpdGUtcGx1Z2luLXNvbGlkJztcblxuY29uc3QgY2VydCA9IGZzLnJlYWRGaWxlU3luYygnLi9zcmMva2V5L2NsaWVudC5jcnQucGVtJyk7XG5jb25zdCBrZXkgPSBmcy5yZWFkRmlsZVN5bmMoJy4vc3JjL2tleS9jbGllbnQua2V5LnBlbScpOyBcbmNvbnN0IGNhID0gZnMucmVhZEZpbGVTeW5jKCcuL3NyYy9rZXkvY2xpZW50LmNoYWluLmNydC5wZW0nKTtcblxuY29uc3QgY3JlYXRlX2h0dHBzX2FnZW50ID0gKHJlamVjdFVuYXV0aG9yaXplZDogYm9vbGVhbikgPT4gbmV3IGh0dHBzLkFnZW50KHtcbiAgY2VydDogY2VydCxcbiAga2V5OiBrZXksXG4gIGNhOiBjYSxcbiAgY2lwaGVyczogXCJBRVMyNTYtR0NNLVNIQTM4NFwiLFxuICByZWplY3RVbmF1dGhvcml6ZWQsXG4gIGtlZXBBbGl2ZTogdHJ1ZSxcbiAga2VlcEFsaXZlTXNlY3M6IDEwMDAsXG4gIG1heFNvY2tldHM6IDUwLFxuICBzZXNzaW9uVGltZW91dDogNjAsXG4gIHNlY3VyZU9wdGlvbnM6IHJlcXVpcmUoJ2NvbnN0YW50cycpLlNTTF9PUF9OT19UTFN2MSB8IHJlcXVpcmUoJ2NvbnN0YW50cycpLlNTTF9PUF9OT19UTFN2MV8xLFxuICBlbmFibGVUcmFjZTogdHJ1ZVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIGNvbnN0IGh0dHBzX2FnZW50ID0gY3JlYXRlX2h0dHBzX2FnZW50KGVudi5WSVRFX1NFUlZFUl9ERVYgPT0gXCJ0cnVlXCIpO1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW3NvbGlkUGx1Z2luKCldLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICd+JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaHR0cHM6IHtcbiAgICAgICAgY2VydDogY2VydCxcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIGNhOiBjYSxcbiAgICAgIH0sXG4gICAgICBwcm94eToge1xuICAgICAgICAnL2FwaSc6IHtcbiAgICAgICAgICB0YXJnZXQ6IGBodHRwczovLyR7ZW52LlZJVEVfU0VSVkVSX0hPU1R9OiR7ZW52LlZJVEVfU0VSVkVSX1BPUlR9YCxcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSxcbiAgICAgICAgICBhZ2VudDogaHR0cHNfYWdlbnRcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHBvcnQ6IDMwMDAsXG4gICAgfSxcbiAgICBidWlsZDoge1xuICAgICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICB9LFxuICB9XG59KTsiXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7OztBQUFxVSxTQUFTLGNBQWMsZUFBZTtBQUMzVyxPQUFPLFVBQVU7QUFDakIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sUUFBUTtBQUNmLE9BQU8saUJBQWlCO0FBSnhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sT0FBTyxHQUFHLGFBQWEsMEJBQTBCO0FBQ3ZELElBQU0sTUFBTSxHQUFHLGFBQWEsMEJBQTBCO0FBQ3RELElBQU0sS0FBSyxHQUFHLGFBQWEsZ0NBQWdDO0FBRTNELElBQU0scUJBQXFCLENBQUMsdUJBQWdDLElBQUksTUFBTSxNQUFNO0FBQUEsRUFDMUU7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0EsU0FBUztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFdBQVc7QUFBQSxFQUNYLGdCQUFnQjtBQUFBLEVBQ2hCLFlBQVk7QUFBQSxFQUNaLGdCQUFnQjtBQUFBLEVBQ2hCLGVBQWUsVUFBUSxXQUFXLEVBQUUsa0JBQWtCLFVBQVEsV0FBVyxFQUFFO0FBQUEsRUFDM0UsYUFBYTtBQUNmLENBQUM7QUFFRCxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsUUFBTSxjQUFjLG1CQUFtQixJQUFJLG1CQUFtQixNQUFNO0FBRXBFLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxZQUFZLENBQUM7QUFBQSxJQUN2QixTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsTUFDcEM7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixPQUFPO0FBQUEsUUFDTDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsT0FBTztBQUFBLFFBQ0wsUUFBUTtBQUFBLFVBQ04sUUFBUSxXQUFXLElBQUksZ0JBQWdCLElBQUksSUFBSSxnQkFBZ0I7QUFBQSxVQUMvRCxjQUFjO0FBQUEsVUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxVQUFVLEVBQUU7QUFBQSxVQUM1QyxPQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE1BQU07QUFBQSxJQUNSO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsSUFDVjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
