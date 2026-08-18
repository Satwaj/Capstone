/**
 * Sandbox API — REST calls for sandbox lifecycle & file operations.
 *
 * Agent calls use /agent-proxy/{sandboxId}/... which the Vite dev server
 * proxies to the agent pod with the correct Host header — no CORS issues.
 */
import { get, post, patch } from "./api";

/**
 * Create a new project.
 * POST /api/sandbox/project
 * @param {string} title
 * @returns {{ message, project: { _id, title, user, __v } }}
 */
export async function createProject(title) {
  return post("/api/sandbox/project", { title });
}

/**
 * Get all projects for the authenticated user.
 * GET /api/sandbox/project
 * @returns {{ message, projects }}
 */
export async function getProjects() {
  return get("/api/sandbox/project");
}

/**
 * Start a new sandbox environment for an existing project.
 * POST /api/sandbox/start
 * @param {string} projectId
 * @returns {{ sandboxId, previewUrl, agentUrl, message }}
 */
export async function startSandbox(projectId) {
  return post("/api/sandbox/start", { projectId });
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
