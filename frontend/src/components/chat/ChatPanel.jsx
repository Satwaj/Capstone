/**
 * ChatPanel — AI chat interface with message list + input.
 */
import { useState, useRef, useEffect } from "react";
import { Send, Square, Loader2 } from "lucide-react";
import ChatMessage from "./ChatMessage";

export default function ChatPanel({
  messages,
  streaming,
  streamingText,
  onSendMessage,
  onCancelStream,
}) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="h-full flex flex-col bg-bg-deep">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin">
        {messages.length === 0 && !streaming && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-text-faint text-[11px] font-mono tracking-wide uppercase mb-1">
                AI Assistant
              </div>
              <div className="text-text-muted text-[12px]">
                Describe the UI you want to build
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Streaming indicator */}
        {streaming && streamingText && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[85%] px-3 py-2 rounded-lg rounded-bl-sm bg-bg-raised border border-border-subtle">
              <div className="whitespace-pre-wrap break-words font-mono text-[12px] text-text-secondary">
                {streamingText}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Loader2 className="w-3 h-3 text-text-muted animate-spin" />
                <span className="text-[10px] text-text-muted">Processing...</span>
              </div>
            </div>
          </div>
        )}

        {streaming && !streamingText && (
          <div className="flex justify-start animate-fade-in">
            <div className="px-3 py-2 rounded-lg rounded-bl-sm bg-bg-raised border border-border-subtle">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
                <span className="text-[12px] text-text-muted font-mono">
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="px-3 pb-3 pt-1 shrink-0"
      >
        <div className="flex items-center gap-2 bg-bg-surface border border-border-default rounded-lg px-3 py-2 focus-within:border-border-hover transition-colors">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            disabled={streaming}
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-muted outline-none font-mono disabled:opacity-50"
          />
          {streaming ? (
            <button
              type="button"
              onClick={onCancelStream}
              className="p-1.5 rounded text-accent-red hover:bg-bg-hover transition-colors"
              title="Stop generation"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
