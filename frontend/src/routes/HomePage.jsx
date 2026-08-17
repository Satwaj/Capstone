/**
 * HomePage — Landing page with "Create Sandbox" button.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Loader2, ArrowRight, Code2, Monitor, MessageSquare } from "lucide-react";
import { startSandbox } from "../services/sandboxApi";

export default function HomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await startSandbox();
      // Navigate to sandbox workspace with state
      navigate(`/sandbox/${data.sandboxId}`, {
        state: {
          sandboxId: data.sandboxId,
          previewUrl: data.previewUrl,
          agentUrl: data.agentUrl,
        },
      });
    } catch (err) {
      setError(err.message || "Failed to create sandbox");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-bg-deepest relative overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 animate-fade-in">
        {/* Logo area */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-bg-surface border border-border-default flex items-center justify-center">
            <Terminal className="w-7 h-7 text-text-tertiary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              Sandbox
            </h1>
            <p className="mt-1.5 text-sm text-text-muted max-w-md">
              Spin up an isolated development environment with AI-powered code generation,
              live preview, and a full terminal.
            </p>
          </div>
        </div>

        {/* Feature indicators */}
        <div className="flex items-center gap-6">
          {[
            { icon: Code2, label: "Code Editor" },
            { icon: Monitor, label: "Live Preview" },
            { icon: Terminal, label: "Terminal" },
            { icon: MessageSquare, label: "AI Chat" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-text-muted">
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono tracking-wide">{label}</span>
            </div>
          ))}
        </div>

        {/* Create button */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="
            group flex items-center gap-3 px-8 py-3.5
            bg-text-primary text-bg-deepest
            rounded-lg font-medium text-sm
            hover:bg-text-secondary active:scale-[0.98]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating sandbox...</span>
            </>
          ) : (
            <>
              <span>Create Sandbox</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>

        {/* Error message */}
        {error && (
          <div className="px-4 py-2 rounded-lg bg-bg-surface border border-accent-red/30 text-accent-red text-[12px] font-mono max-w-md text-center animate-fade-in">
            {error}
          </div>
        )}
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />
    </div>
  );
}
