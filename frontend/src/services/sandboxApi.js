/**
 * Sandbox API — REST calls for sandbox lifecycle & file operations.
 *
 * Agent calls use /agent-proxy/{sandboxId}/... which the Vite dev server
 * proxies to the agent pod with the correct Host header — no CORS issues.
 */
import { get, post, patch } from "./api";

/**
 * Start a new sandbox environment.
 * POST /api/sandbox/start
 * @returns {{ sandboxId, previewUrl, agentUrl, message }}
 */
export async function startSandbox() {
  return post("/api/sandbox/start");
}

/**
 * List all files in the sandbox workspace.
 * @param {string} sandboxId
 * @returns {{ files: string[] }}
 */
export async function listFiles(sandboxId) {
  return get(`/agent-proxy/${sandboxId}/list-files`);
}

/**
 * Read content of one or more files.
 * @param {string}   sandboxId
 * @param {string[]} filePaths
 * @returns {{ files: Array<{ [path]: string }> }}
 */
export async function readFiles(sandboxId, filePaths) {
  const query = filePaths.join(",");
  return get(`/agent-proxy/${sandboxId}/read-files?files=${encodeURIComponent(query)}`);
}

/**
 * Update (patch) files in the sandbox.
 * @param {string} sandboxId
 * @param {Array<{ file: string, content: string }>} updates
 */
export async function updateFiles(sandboxId, updates) {
  return patch(`/agent-proxy/${sandboxId}/update-files`, { updates });
}
