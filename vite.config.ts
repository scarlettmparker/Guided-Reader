import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => {
  const allowedHosts =
    process.env.ALLOWED_HOSTS?.split(",")
      .map((h) => h.trim())
      .filter(Boolean) ?? [];

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      allowedHosts,
    },
    assetsInclude: ["**/*.json"],
    json: {
      stringify: true,
    },
    build: {
      manifest: true,
      rollupOptions: {
        input: {
          client: "/src/entry-client.tsx",
        },
      },
      outDir: "dist/client",
      cssCodeSplit: true,
    },
    ssr: {
      noExternal: ["react-router-dom", "@posthog/react", "@sun/components"],
      external: ["@sun/ssr"],
    },
  };
});
