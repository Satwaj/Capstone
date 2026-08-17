/**
 * PreviewPanel — iframe live preview of the sandbox app.
 *
 * Shows a "sandbox starting" state when the preview URL returns Bad Gateway,
 * then auto-refreshes until the sandbox is ready.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, ExternalLink, Loader2, Wifi } from "lucide-react";

export default function PreviewPanel({ previewUrl }) {
  const [iframeKey, setIframeKey] = useState(0);
  const [loadState, setLoadState] = useState("loading"); // "loading" | "ready" | "waiting"
  const retryRef = useRef(null);
  const attemptRef = useRef(0);

  const refresh = useCallback(() => {
    if (retryRef.current) clearInterval(retryRef.current);
    setLoadState("loading");
    attemptRef.current = 0;
    setIframeKey((k) => k + 1);
  }, []);

  // Auto-retry every 4 s while in "waiting" state
  useEffect(() => {
    if (loadState === "waiting") {
      retryRef.current = setInterval(() => {
        attemptRef.current += 1;
        setLoadState("loading");
        setIframeKey((k) => k + 1);
      }, 4000);
    } else {
      if (retryRef.current) clearInterval(retryRef.current);
    }
    return () => { if (retryRef.current) clearInterval(retryRef.current); };
  }, [loadState]);

  if (!previewUrl) {
    return (
      <div className="h-full flex flex-col bg-bg-deep">
        <div className="h-9 flex items-center px-3 border-b border-border-default shrink-0">
          <span className="text-[10px] font-semibold tracking-[0.12em] text-text-muted uppercase">Preview</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[11px] text-text-faint font-mono">No preview URL</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-bg-deep">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-border-default shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[0.12em] text-text-muted uppercase">Preview</span>
          {loadState === "waiting" && (
            <span className="flex items-center gap-1 text-[10px] text-accent-amber font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-amber animate-pulse" />
              Starting…
            </span>
          )}
          {loadState === "ready" && (
            <span className="flex items-center gap-1 text-[10px] text-accent-green font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={refresh}
            className="p-1 rounded text-text-muted hover:text-text-tertiary hover:bg-bg-hover transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-text-muted hover:text-text-tertiary hover:bg-bg-hover transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Loading overlay */}
        {loadState === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-deep z-10">
            <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
          </div>
        )}

        {/* Waiting overlay */}
        {loadState === "waiting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-deep z-10 gap-3">
            <div className="relative">
              <Wifi className="w-6 h-6 text-text-faint" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-amber animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[12px] text-text-muted font-mono">Sandbox is starting…</p>
              <p className="text-[11px] text-text-faint">Auto-refreshing every 4 seconds</p>
              {attemptRef.current > 0 && (
                <p className="text-[10px] text-text-faint">Attempt {attemptRef.current + 1}</p>
              )}
            </div>
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono
                         bg-bg-surface border border-border-default text-text-tertiary
                         hover:bg-bg-hover hover:text-text-primary transition-colors mt-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh now
            </button>
          </div>
        )}

        {/* The iframe — always mounted so it loads in background */}
        <iframe
          key={iframeKey}
          src={previewUrl}
          className="w-full h-full border-0"
          title="Sandbox Preview"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
          onLoad={(e) => {
            // Try to detect Bad Gateway / error pages via title or content
            try {
              const doc = e.target.contentDocument;
              const title = doc?.title || "";
              const body = doc?.body?.innerText || "";
              const isBadGateway =
                title.includes("502") ||
                title.includes("Bad Gateway") ||
                body.includes("Bad Gateway") ||
                body.includes("ECONNREFUSED") ||
                body.includes("connect ECON");

              if (isBadGateway) {
                setLoadState("waiting");
              } else {
                setLoadState("ready");
              }
            } catch {
              // Cross-origin — treat as ready (the app is running on its own domain)
              setLoadState("ready");
            }
          }}
          onError={() => setLoadState("waiting")}
        />
      </div>
    </div>
  );
}
