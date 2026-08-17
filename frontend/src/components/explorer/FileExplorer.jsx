/**
 * FileExplorer — Sidebar file tree with connecting/retry states.
 */
import { RefreshCw, Loader2, AlertCircle, Wifi } from "lucide-react";
import FileTreeItem from "./FileTreeItem";

export default function FileExplorer({
  fileTree,
  expandedFolders,
  selectedFile,
  loading,
  error,
  retryCount,
  isReady,
  onToggleFolder,
  onSelectFile,
  onRefresh,
  sortChildren,
}) {
  const rootChildren = sortChildren(fileTree?.children || {});

  // Determine what to show in the body
  const isConnecting = !isReady && (loading || (error && error.startsWith("Connecting")));
  const isError = error && !isConnecting;
  const isEmpty = isReady && !loading && rootChildren.length === 0;

  return (
    <div className="h-full flex flex-col bg-bg-deep">
      {/* Header */}
      <div className="h-9 flex items-center justify-between px-3 border-b border-border-default shrink-0">
        <span className="text-[10px] font-semibold tracking-[0.12em] text-text-muted uppercase">
          Explorer
        </span>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-1 rounded text-text-muted hover:text-text-tertiary hover:bg-bg-hover transition-colors disabled:opacity-50"
          title="Refresh file list"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 scrollbar-thin">

        {/* ── Connecting state ── */}
        {isConnecting && (
          <div className="px-3 py-6 flex flex-col items-center gap-3 text-center">
            <div className="relative">
              <Wifi className="w-5 h-5 text-text-faint" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent-amber animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-text-muted font-mono">
                Waiting for sandbox…
              </p>
              <p className="text-[10px] text-text-faint">
                Attempt {retryCount + 1}
              </p>
            </div>
          </div>
        )}

        {/* ── Error / manual retry state ── */}
        {isError && (
          <div className="px-3 py-5 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="w-4.5 h-4.5 text-accent-red/60" />
            <p className="text-[11px] text-text-muted font-mono leading-relaxed max-w-[180px]">
              {error}
            </p>
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-mono
                         bg-bg-surface border border-border-default text-text-tertiary
                         hover:bg-bg-hover hover:text-text-primary transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {/* ── Empty ── */}
        {isEmpty && (
          <div className="px-3 py-6 text-center text-[11px] text-text-muted">
            No files found
          </div>
        )}

        {/* ── File tree ── */}
        {isReady && rootChildren.length > 0 && (
          rootChildren.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              depth={0}
              expandedFolders={expandedFolders}
              selectedFile={selectedFile}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              sortChildren={sortChildren}
            />
          ))
        )}
      </div>
    </div>
  );
}
