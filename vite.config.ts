import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import portfinder from "portfinder";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const defaultApiPort = 3001;
  const apiPort = await portfinder.getPortPromise({ port: defaultApiPort });

  if (apiPort !== defaultApiPort) {
    console.log(`Port ${defaultApiPort} is in use, starting API server on ${apiPort} instead.`);
  }

  return {
    server: {
      host: "::",
      port: 8080,
      fs: {
        allow: [".", "./client", "./shared"],
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
      },
      proxy: {
        "/api": {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist/spa",
    },
    plugins: [react(), expressPlugin(apiPort)],
    css: {
      postcss: './postcss.config.cjs'
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});

function expressPlugin(port: number): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    async buildStart() {
      // Start Express server on the determined port
      try {
        const app = await createServer();
        app.listen(port, () => {
          console.log(
            `Express API server running on http://localhost:${port}`,
          );
        });
      } catch (error) {
        console.error("Failed to create or start server:", error);
      }
    },
  };
}
