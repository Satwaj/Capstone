import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: { clientPort: 5173 },
    proxy: {
      // ── Backend REST API (sandbox start, AI invoke) ─────────────────────
      "/api": {
        target: "http://127.0.0.1:80",
        changeOrigin: true,
        secure: false,
      },

      // ── Agent REST proxy ─────────────────────────────────────────────────
      // Browser calls: /agent-proxy/{sandboxId}/list-files
      // Vite rewrites to: /list-files and sets Host: {sandboxId}.agent.127.0.0.1.nip.io
      // This avoids ALL CORS issues — browser only ever talks to localhost:5173
      "/agent-proxy": {
        target: "http://127.0.0.1:80",
        changeOrigin: false,
        secure: false,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            // req.url = /agent-proxy/{sandboxId}/path?query
            const match = req.url?.match(/^\/agent-proxy\/([^/?]+)(\/[^?]*)?(\?.*)?/);
            if (match) {
              const sandboxId = match[1];
              const path      = match[2] || "/";
              const query     = match[3] || "";
              // Rewrite path — strip the /agent-proxy/{sandboxId} prefix
              proxyReq.path = path + query;
              // Set Host header so ingress routes to the right sandbox pod
              proxyReq.setHeader("Host", `${sandboxId}.agent.127.0.0.1.nip.io`);
            }
          });
          proxy.on("error", (err) =>
            console.error("[agent-proxy] error:", err.message)
          );
        },
      },

      // ── Socket.IO proxy (terminal) ───────────────────────────────────────
      // Browser connects: /terminal-proxy/{sandboxId}/socket.io/...
      // Vite WebSocket-proxies to the agent pod via ingress
      "/terminal-proxy": {
        target: "http://127.0.0.1:80",
        changeOrigin: false,
        ws: true,
        secure: false,
        configure: (proxy) => {
          const setTerminalHost = (proxyReq, req) => {
            const match = (req.url || "").match(/^\/terminal-proxy\/([^/?]+)/);
            if (match) {
              const sandboxId = match[1];
              const stripped  = req.url.replace(/^\/terminal-proxy\/[^/?]+/, "");
              proxyReq.path = stripped || "/";
              proxyReq.setHeader("Host", `${sandboxId}.agent.127.0.0.1.nip.io`);
            }
          };
          proxy.on("proxyReq",   setTerminalHost);
          proxy.on("proxyReqWs", setTerminalHost);
          proxy.on("error", (err) =>
            console.error("[terminal-proxy] error:", err.message)
          );
        },
      },
    },
  },
});
