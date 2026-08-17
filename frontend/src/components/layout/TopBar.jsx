/**
 * TopBar — Header bar with logo, sandbox status, and sandbox ID.
 */
import { Terminal, Circle, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";

export default function TopBar({ sandboxId }) {
  const [copied, setCopied] = useState(false);

  const copyId = useCallback(() => {
    if (sandboxId) {
      navigator.clipboard.writeText(sandboxId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [sandboxId]);

  return (
    <header className="h-12 flex items-center justify-between px-4 bg-bg-base border-b border-border-default shrink-0 select-none">
      {/* Left — Brand */}
      <div className="flex items-center gap-2.5">
        <Terminal className="w-4 h-4 text-text-tertiary" />
        <span className="font-mono text-xs font-bold tracking-[0.15em] text-text-primary uppercase">
          Sandbox
        </span>
      </div>

      {/* Center — Status */}
      <div className="flex items-center gap-4">
        {sandboxId && (
          <div className="flex items-center gap-2">
            <Circle className="w-2 h-2 fill-accent-green text-accent-green animate-pulse-glow" />
            <span className="text-[11px] font-mono text-text-tertiary">
              Running
            </span>
          </div>
        )}
      </div>

      {/* Right — Sandbox ID */}
      <div className="flex items-center gap-2">
        {sandboxId && (
          <button
            onClick={copyId}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono text-text-muted hover:text-text-tertiary hover:bg-bg-hover transition-colors"
            title="Copy sandbox ID"
          >
            <span className="max-w-[180px] truncate">{sandboxId}</span>
            {copied ? (
              <Check className="w-3 h-3 text-accent-green" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
