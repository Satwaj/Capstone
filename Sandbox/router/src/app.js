import express from "express";
import morgan from "morgan";
import {
    createProxyMiddleware
} from "http-proxy-middleware";

const app = express();

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
            ws: true,
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
            ws: true,
        });
    }

    return agentProxies[sandboxId];
}

// Route requests based on subdomain
app.use((req, res, next) => {
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

    if (type === "agent") {
        return getAgentProxy(sandboxId)(req, res, next);
    }

    if (type === "preview") {
        return getProxy(sandboxId)(req, res, next);
    }

    return next();
});

export default app;