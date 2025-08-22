import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      createServer().then(app => {
        console.log('Express app created and ready');

        // Add Express app as middleware to Vite dev server
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api')) {
            console.log(`API request: ${req.method} ${req.url}`);
            // Call the Express app directly
            app(req, res, (err: any) => {
              if (err) {
                console.error('Express middleware error:', err);
              }
              next(err);
            });
          } else {
            next();
          }
        });
      }).catch(error => {
        console.error('Failed to create server:', error);
      });
    },
  };
}
