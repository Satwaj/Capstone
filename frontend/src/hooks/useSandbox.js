/**
 * useSandbox — Manages sandbox lifecycle state.
 */
import { useState, useCallback } from "react";
import { startSandbox as startSandboxApi } from "../services/sandboxApi";

export function useSandbox() {
  const [sandboxId, setSandboxId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [agentUrl, setAgentUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const startSandbox = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await startSandboxApi();
      setSandboxId(data.sandboxId);
      setPreviewUrl(data.previewUrl);
      setAgentUrl(data.agentUrl);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sandboxId,
    previewUrl,
    agentUrl,
    loading,
    error,
    startSandbox,
    // Allow manual override (e.g. from URL params)
    setSandboxId,
    setPreviewUrl,
    setAgentUrl,
  };
}
