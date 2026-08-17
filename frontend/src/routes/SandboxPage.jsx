/**
 * SandboxPage — Main IDE workspace with 3-panel layout.
 *
 * Layout:
 * ┌──────────────────────────────────────────────────────────┐
 * │  TopBar                                                  │
 * ├────────┬─────────────────────────┬───────────────────────┤
 * │  FILE  │  CodeViewer / TabBar     │  Preview (iframe)     │
 * │  TREE  │                         │                       │
 * │        ├─────────────────────────┴───────────────────────┤
 * │        │  [Terminal] [AI Chat]                            │
 * └────────┴─────────────────────────────────────────────────┘
 */
import { useState, useCallback, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

// Layout
import TopBar from "../components/layout/TopBar";
import PanelResizer from "../components/layout/PanelResizer";

// Panels
import FileExplorer from "../components/explorer/FileExplorer";
import TabBar from "../components/editor/TabBar";
import CodeViewer from "../components/editor/CodeViewer";
import PreviewPanel from "../components/preview/PreviewPanel";
import TerminalPanel from "../components/terminal/TerminalPanel";
import ChatPanel from "../components/chat/ChatPanel";

// Hooks
import { useFileExplorer } from "../hooks/useFileExplorer";
import { useTerminal } from "../hooks/useTerminal";
import { useChat } from "../hooks/useChat";
import { useCodeViewer } from "../hooks/useCodeViewer";

// Icons
import { TerminalSquare, MessageSquare } from "lucide-react";

export default function SandboxPage() {
  const { id } = useParams();
  const location = useLocation();

  // Get sandbox data from navigation state
  const sandboxId = id;
  const previewUrl = location.state?.previewUrl || null;
  const agentUrl = location.state?.agentUrl || null;

  // Panel sizing state
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [bottomHeight, setBottomHeight] = useState(260);
  const [editorRatio, setEditorRatio] = useState(0.5); // 0-1 ratio for code vs preview
  const [activeBottomTab, setActiveBottomTab] = useState("terminal");

  // All hooks use sandboxId only — REST + WS go through Vite proxy (no CORS)
  const fileExplorer = useFileExplorer(sandboxId);
  const terminal     = useTerminal(sandboxId);
  const chat         = useChat(sandboxId);
  const codeViewer   = useCodeViewer(sandboxId);

  // File selection → open in code viewer
  const handleFileSelect = useCallback(
    (filePath) => {
      fileExplorer.selectFile(filePath);
      codeViewer.openFile(filePath);
    },
    [fileExplorer, codeViewer]
  );

  // Panel resize handlers
  const handleSidebarResize = useCallback((delta) => {
    setSidebarWidth((w) => Math.max(180, Math.min(450, w + delta)));
  }, []);

  const handleBottomResize = useCallback((delta) => {
    setBottomHeight((h) => Math.max(120, Math.min(500, h - delta)));
  }, []);

  const handleEditorResize = useCallback((delta) => {
    setEditorRatio((r) => {
      const containerWidth = window.innerWidth - sidebarWidth - 3; // subtract resizer
      const newRatio = r + delta / containerWidth;
      return Math.max(0.2, Math.min(0.8, newRatio));
    });
  }, [sidebarWidth]);

  // Active file content for code viewer
  const activeContent = codeViewer.activeTab
    ? codeViewer.fileContents[codeViewer.activeTab] || null
    : null;

  const activeHighlighted = codeViewer.activeTab
    ? codeViewer.getHighlightedContent(codeViewer.activeTab)
    : null;

  return (
    <div className="h-full w-full flex flex-col bg-bg-deepest overflow-hidden">
      {/* Top Bar */}
      <TopBar sandboxId={sandboxId} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ── Left: File Explorer ── */}
        <div
          className="shrink-0 overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          <FileExplorer
            fileTree={fileExplorer.fileTree}
            expandedFolders={fileExplorer.expandedFolders}
            selectedFile={fileExplorer.selectedFile}
            loading={fileExplorer.loading}
            error={fileExplorer.error}
            retryCount={fileExplorer.retryCount}
            isReady={fileExplorer.isReady}
            onToggleFolder={fileExplorer.toggleFolder}
            onSelectFile={handleFileSelect}
            onRefresh={fileExplorer.fetchFiles}
            sortChildren={fileExplorer.sortChildren}
          />
        </div>

        {/* Sidebar Resizer */}
        <PanelResizer direction="horizontal" onResize={handleSidebarResize} />

        {/* ── Center: Editor + Preview + Bottom Panel ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top area: Code + Preview */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Code Editor Area */}
            <div
              className="flex flex-col min-w-0 overflow-hidden"
              style={{ width: `${editorRatio * 100}%` }}
            >
              <TabBar
                tabs={codeViewer.openTabs}
                activeTab={codeViewer.activeTab}
                onSelectTab={codeViewer.setActiveTab}
                onCloseTab={codeViewer.closeTab}
              />
              <div className="flex-1 min-h-0 overflow-hidden">
                <CodeViewer
                  content={activeContent}
                  highlightedHtml={activeHighlighted}
                  filePath={codeViewer.activeTab}
                  loading={codeViewer.loading}
                />
              </div>
            </div>

            {/* Editor/Preview Resizer */}
            <PanelResizer direction="horizontal" onResize={handleEditorResize} />

            {/* Preview Area */}
            <div
              className="min-w-0 overflow-hidden"
              style={{ width: `${(1 - editorRatio) * 100}%` }}
            >
              <PreviewPanel previewUrl={previewUrl} />
            </div>
          </div>

          {/* Bottom Resizer */}
          <PanelResizer direction="vertical" onResize={handleBottomResize} />

          {/* ── Bottom: Terminal / Chat ── */}
          <div
            className="shrink-0 flex flex-col overflow-hidden border-t border-border-default"
            style={{ height: bottomHeight }}
          >
            {/* Tab bar */}
            <div className="h-8 flex items-center bg-bg-base border-b border-border-default shrink-0 px-1 gap-0.5">
              <button
                onClick={() => setActiveBottomTab("terminal")}
                className={`
                  flex items-center gap-1.5 px-3 h-full text-[11px] font-mono
                  transition-colors border-b-2
                  ${activeBottomTab === "terminal"
                    ? "text-text-primary border-b-accent-green"
                    : "text-text-muted border-b-transparent hover:text-text-tertiary"
                  }
                `}
              >
                <TerminalSquare className="w-3 h-3" />
                Terminal
              </button>
              <button
                onClick={() => setActiveBottomTab("chat")}
                className={`
                  flex items-center gap-1.5 px-3 h-full text-[11px] font-mono
                  transition-colors border-b-2
                  ${activeBottomTab === "chat"
                    ? "text-text-primary border-b-accent-green"
                    : "text-text-muted border-b-transparent hover:text-text-tertiary"
                  }
                `}
              >
                <MessageSquare className="w-3 h-3" />
                AI Chat
                {chat.streaming && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-glow" />
                )}
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <div className={activeBottomTab === "terminal" ? "h-full" : "hidden"}>
                <TerminalPanel
                  initTerminal={terminal.initTerminal}
                  fitTerminal={terminal.fitTerminal}
                />
              </div>
              <div className={activeBottomTab === "chat" ? "h-full" : "hidden"}>
                <ChatPanel
                  messages={chat.messages}
                  streaming={chat.streaming}
                  streamingText={chat.streamingText}
                  onSendMessage={chat.sendMessage}
                  onCancelStream={chat.cancelStream}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
