import express from "express";
import morgan from "morgan";
import {
    createProxyMiddleware
} from "http-proxy-middleware";
import { createProxyServer } from 'httpxy';
import http from "http";
import { refreshTTL } from "./config/redis.js";

const app = express();

const wsProxy = createProxyServer({ changeOrigin: true });
wsProxy.on('error', (err, req, socket) => { socket?.destroy(); });

app.use(morgan("combined"));

// Health check
app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});

// Readiness check
app.get("/api/status/readyz", (req, res) => {
    res.status(200).json({
        status: "ready",
    });
});

const proxies = {};
const agentProxies = {};

// Preview proxy
function getProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}`;

    if (!proxies[sandboxId]) {
        proxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            on: {
                error: (err, req, res) => {
                    console.error(`[Proxy Error] Failed to proxy preview request ${req.url} to ${target}:`, err.message);
                    if (res && !res.headersSent) {
                        res.status(502).json({
                            error: "Bad Gateway",
                            message: `Error occurred while trying to proxy to sandbox ${sandboxId}: ${err.message}`
                        });
                    }
                }
            }
        });
    }

    return proxies[sandboxId];
}

// Agent proxy
function getAgentProxy(sandboxId) {
    const target = `http://sandbox-service-${sandboxId}:3000`;

    if (!agentProxies[sandboxId]) {
        agentProxies[sandboxId] = createProxyMiddleware({
            target,
            changeOrigin: true,
            on: {
                error: (err, req, res) => {
                    console.error(`[Proxy Error] Failed to proxy agent request ${req.url} to ${target}:`, err.message);
                    if (res && !res.headersSent) {
                        res.status(502).json({
                            error: "Bad Gateway",
                            message: `Error occurred while trying to proxy to sandbox agent ${sandboxId}: ${err.message}`
                        });
                    }
                }
            }
        });
    }

    return agentProxies[sandboxId];
}

// Route requests based on subdomain
app.use(async (req, res, next) => {
    const host = req.headers.host || "";

    // Remove port if present
    const hostname = host.split(":")[0];
    const parts = hostname.split(".");

    /*
      Preview:
      <sandbox-id>.preview.localhost

      Agent:
      <sandbox-id>.agent.localhost
    */

    const sandboxId = parts[0];
    const type = parts[1];

    if (!sandboxId || !type) {
        return next();
    }

    try {
        await refreshTTL(sandboxId);
    } catch (err) {
        console.error(`[Redis TTL Error] Failed to refresh TTL for ${sandboxId}:`, err.message);
    }

    if (type === "agent") {
        return getAgentProxy(sandboxId)(req, res, next);
    }

    if (type === "preview") {
        return getProxy(sandboxId)(req, res, next);
    }

    return next();
});


// Create the HTTP server explicitly
const server = http.createServer(app);

// ✅ Handle WebSocket upgrades — using httpxy for v4 compatibility
server.on('upgrade', (req, socket, head) => {
    socket.on('error', () => socket.destroy());   // guard against EPIPE during live pipe
    const host = req.headers.host;
    const sandboxId = host.split('.')[0];
    const type = host.split('.')[1];

    console.log(`WS upgrade request: ${host}, sandboxId: ${sandboxId}, type: ${type}`);

    if (type === 'agent') {
        wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}:3000` }, head)
            .catch(() => socket.destroy());
    } else if (type === 'preview') {
        wsProxy.ws(req, socket, { target: `http://sandbox-service-${sandboxId}` }, head)
            .catch(() => socket.destroy());
    } else {
        socket.destroy();
    }
});


export default server; // export server, not app
