/**
 * Socket Service — Socket.IO connection for terminal I/O.
 *
 * Connects via the Vite WebSocket proxy at /terminal-proxy/{sandboxId}/socket.io/
 * so the browser never makes a cross-origin connection — no CORS issues.
 *
 * Events:
 *   emit  "terminal-input"   → keystrokes to the PTY
 *   on    "terminal-output"  → raw PTY output back to xterm
 */
import { io } from "socket.io-client";

let socket = null;
let currentSandboxId = null;

/**
 * Create a Socket.IO connection for the given sandbox.
 * @param {string} sandboxId
 * @returns {import("socket.io-client").Socket}
 */
export function createTerminalSocket(sandboxId) {
  // Disconnect if already connected to a different sandbox
  if (socket && currentSandboxId !== sandboxId) {
    socket.disconnect();
    socket = null;
  }
  if (socket?.connected) return socket;

  currentSandboxId = sandboxId;

  // Connect to localhost:5173 via the proxy path — same origin, no CORS
  socket = io(window.location.origin, {
    path: `/terminal-proxy/${sandboxId}/socket.io/`,
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 15000,
    forceNew: true,
  });

  socket.on("connect", () => {
    console.log("[Terminal] Socket connected, id:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.warn("[Terminal] Socket disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Terminal] Connect error:", err.message);
  });

  return socket;
}

/**
 * Send a keystroke / command to the PTY.
 * @param {string} data
 */
export function sendTerminalInput(data) {
  if (socket?.connected) {
    socket.emit("terminal-input", data);
  }
}

/**
 * Subscribe to PTY output.
 * @param {function} callback – receives raw terminal output string
 * @returns {function} unsubscribe
 */
export function onTerminalOutput(callback) {
  if (!socket) return () => {};
  socket.on("terminal-output", callback);
  return () => socket?.off("terminal-output", callback);
}

/** Disconnect and clear the current socket. */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentSandboxId = null;
  }
}

/** Get the current socket instance. */
export function getSocket() {
  return socket;
}
