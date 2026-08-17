/**
 * ChatMessage — Individual message bubble (user or assistant).
 */

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}
    >
      <div
        className={`
          max-w-[85%] px-3 py-2 rounded-lg text-[13px] leading-relaxed
          ${isUser
            ? "bg-bg-active text-text-primary rounded-br-sm"
            : message.isError
              ? "bg-bg-raised border border-accent-red/30 text-accent-red rounded-bl-sm"
              : "bg-bg-raised text-text-secondary border border-border-subtle rounded-bl-sm"
          }
        `}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words font-mono text-[12px]">
          {message.content}
        </div>

        {/* Timestamp */}
        <div
          className={`
            mt-1 text-[10px]
            ${isUser ? "text-text-muted text-right" : "text-text-muted"}
          `}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
}
