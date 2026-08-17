/**
 * useFileExplorer — Builds a tree from flat file list, with auto-retry.
 *
 * Uses /agent-proxy/{sandboxId}/... via Vite proxy — no CORS.
 */
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { listFiles } from "../services/sandboxApi";

const RETRY_DELAYS_MS = [1500, 2000, 3000, 4000, 5000, 5000, 5000, 5000];

function buildFileTree(files) {
  const root = { name: "root", type: "folder", children: {}, path: "" };
  for (const filePath of files) {
    const parts = filePath.replace(/\\/g, "/").split("/");
    let cur = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      const isFile = i === parts.length - 1;
      const fullPath = parts.slice(0, i + 1).join("/");
      if (!cur.children[part]) {
        cur.children[part] = {
          name: part,
          type: isFile ? "file" : "folder",
          children: isFile ? null : {},
          path: fullPath,
        };
      }
      if (!isFile) cur = cur.children[part];
    }
  }
  return root;
}

function sortChildren(children) {
  if (!children) return [];
  return Object.values(children).sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function useFileExplorer(sandboxId) {
  const [files, setFiles] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState(new Set(["src", "public"]));
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const timerRef   = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const doFetch = useCallback(async (attempt) => {
    if (!sandboxId || !mountedRef.current) return;
    setLoading(true);
    try {
      const data = await listFiles(sandboxId);
      if (!mountedRef.current) return;
      setFiles(data.files || []);
      setIsReady(true);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      if (!mountedRef.current) return;
      console.warn(`[FileExplorer] attempt ${attempt + 1} failed:`, err.message);
      const delay = RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)];
      setRetryCount(attempt + 1);
      if (attempt < RETRY_DELAYS_MS.length) {
        setError(`Connecting to sandbox… (attempt ${attempt + 1})`);
        timerRef.current = setTimeout(() => {
          if (mountedRef.current) doFetch(attempt + 1);
        }, delay);
      } else {
        setError(`Cannot reach sandbox: ${err.message}`);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [sandboxId]);

  // Manual refresh
  const refresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsReady(false);
    setRetryCount(0);
    setError(null);
    doFetch(0);
  }, [doFetch]);

  // Auto-start on mount / sandboxId change
  useEffect(() => {
    if (!sandboxId) return;
    setFiles([]);
    setIsReady(false);
    setError(null);
    setRetryCount(0);
    doFetch(0);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [sandboxId, doFetch]);

  const fileTree = useMemo(() => buildFileTree(files), [files]);

  const toggleFolder = useCallback((p) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  }, []);

  const selectFile = useCallback((p) => setSelectedFile(p), []);

  return {
    files, fileTree, expandedFolders, selectedFile,
    loading, error, retryCount, isReady,
    fetchFiles: refresh, toggleFolder, selectFile, sortChildren,
  };
}
