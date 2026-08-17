/**
 * useCodeViewer — Tab management + file content reading with syntax highlighting.
 *
 * Uses /agent-proxy/{sandboxId}/... via Vite proxy — no CORS.
 */
import { useState, useCallback } from "react";
import { readFiles } from "../services/sandboxApi";
import hljs from "highlight.js/lib/core";

import javascript from "highlight.js/lib/languages/javascript";
import xml        from "highlight.js/lib/languages/xml";
import css        from "highlight.js/lib/languages/css";
import json       from "highlight.js/lib/languages/json";
import markdown   from "highlight.js/lib/languages/markdown";
import typescript from "highlight.js/lib/languages/typescript";
import bash       from "highlight.js/lib/languages/bash";
import yaml       from "highlight.js/lib/languages/yaml";
import dockerfile from "highlight.js/lib/languages/dockerfile";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("jsx",        javascript);
hljs.registerLanguage("xml",        xml);
hljs.registerLanguage("html",       xml);
hljs.registerLanguage("css",        css);
hljs.registerLanguage("json",       json);
hljs.registerLanguage("markdown",   markdown);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("tsx",        typescript);
hljs.registerLanguage("bash",       bash);
hljs.registerLanguage("yaml",       yaml);
hljs.registerLanguage("dockerfile", dockerfile);

function getLanguage(filePath) {
  const ext  = filePath.split(".").pop()?.toLowerCase();
  const name = filePath.split("/").pop()?.toLowerCase();
  const map  = {
    js: "javascript", jsx: "jsx", ts: "typescript", tsx: "tsx",
    css: "css", html: "html", json: "json", md: "markdown",
    yml: "yaml", yaml: "yaml", sh: "bash",
    dockerfile: "dockerfile", gitignore: "bash", dockerignore: "bash",
  };
  return map[ext] || map[name] || null;
}

export function useCodeViewer(sandboxId) {
  const [openTabs,    setOpenTabs]    = useState([]);
  const [activeTab,   setActiveTab]   = useState(null);
  const [fileContents, setFileContents] = useState({});
  const [loading,     setLoading]     = useState(false);

  const openFile = useCallback(async (filePath) => {
    setOpenTabs((prev) => prev.includes(filePath) ? prev : [...prev, filePath]);
    setActiveTab(filePath);

    if (!fileContents[filePath] && sandboxId) {
      setLoading(true);
      try {
        const data = await readFiles(sandboxId, [filePath]);
        if (data.files?.length > 0) {
          const fileObj = data.files[0];
          const key     = Object.keys(fileObj)[0];
          setFileContents((prev) => ({ ...prev, [filePath]: fileObj[key] }));
        }
      } catch (err) {
        console.error("[CodeViewer] read error:", err);
        setFileContents((prev) => ({
          ...prev,
          [filePath]: `// Error loading file: ${err.message}`,
        }));
      } finally {
        setLoading(false);
      }
    }
  }, [sandboxId, fileContents]);

  const closeTab = useCallback((filePath) => {
    setOpenTabs((prev) => {
      const next = prev.filter((f) => f !== filePath);
      if (activeTab === filePath) {
        const idx = prev.indexOf(filePath);
        setActiveTab(next[Math.min(idx, next.length - 1)] || null);
      }
      return next;
    });
    setFileContents((prev) => { const n = { ...prev }; delete n[filePath]; return n; });
  }, [activeTab]);

  const getHighlightedContent = useCallback((filePath) => {
    const content = fileContents[filePath];
    if (!content) return null;
    const lang = getLanguage(filePath);
    try {
      if (lang && hljs.getLanguage(lang))
        return hljs.highlight(content, { language: lang }).value;
      return hljs.highlightAuto(content).value;
    } catch {
      return content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [fileContents]);

  return {
    openTabs, activeTab, fileContents, loading,
    openFile, closeTab, setActiveTab, getHighlightedContent,
  };
}
