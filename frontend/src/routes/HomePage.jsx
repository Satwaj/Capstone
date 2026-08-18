/**
 * HomePage — Landing page with "Create Sandbox" button.
 *
 * Flow:
 *  1. User clicks "Create Sandbox" → modal opens asking for a project title.
 *  2. POST /api/sandbox/project  → get projectId
 *  3. POST /api/sandbox/start    → get sandboxId / URLs
 *  4. Navigate to /sandbox/:id
 */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Terminal, Loader2, ArrowRight, Code2, Monitor, MessageSquare, X } from "lucide-react";
import { createProject, startSandbox } from "../services/sandboxApi";

export default function HomePage() {
  const navigate = useNavigate();

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [title, setTitle]           = useState("");

  // Async state
  const [loading, setLoading]       = useState(false);
  const [step, setStep]             = useState("");   // human-readable progress
  const [error, setError]           = useState(null);

  const inputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  const openModal = () => {
    setTitle("");
    setError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (loading) return;   // don't close while in flight
    setModalOpen(false);
    setError(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      // Step 1 – create project
      setStep("Creating project…");
      const { project } = await createProject(trimmed);

      // Step 2 – start sandbox
      setStep("Spinning up sandbox…");
      const data = await startSandbox(project._id);

      navigate(`/sandbox/${data.sandboxId}`, {
        state: {
          sandboxId:  data.sandboxId,
          previewUrl: data.previewUrl,
          agentUrl:   data.agentUrl,
          projectId:  project._id,
          title:      project.title,
        },
      });
    } catch (err) {
      setError(err.message || "Failed to create sandbox");
    } finally {
      setLoading(false);
      setStep("");
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
          onClick={openModal}
          className="
            group flex items-center gap-3 px-8 py-3.5
            bg-text-primary text-bg-deepest
            rounded-lg font-medium text-sm
            hover:bg-text-secondary active:scale-[0.98]
            transition-all duration-200
          "
        >
          <span>Create Sandbox</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-default to-transparent" />

      {/* ── Project Title Modal ── */}
      {modalOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-bg-deepest/70 backdrop-blur-sm animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-sm mx-4 bg-bg-surface border border-border-default rounded-xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
              <h2 className="text-sm font-semibold text-text-primary">New Sandbox</h2>
              <button
                onClick={closeModal}
                disabled={loading}
                className="text-text-muted hover:text-text-primary transition-colors disabled:opacity-40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-text-muted uppercase tracking-widest">
                  Project title
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="my-awesome-project"
                  disabled={loading}
                  className="
                    w-full px-3 py-2.5 rounded-lg
                    bg-bg-deepest border border-border-default
                    text-sm text-text-primary placeholder:text-text-muted
                    focus:outline-none focus:border-text-tertiary
                    disabled:opacity-50
                    transition-colors font-mono
                  "
                />
              </div>

              {/* Error */}
              {error && (
                <div className="px-3 py-2 rounded-lg bg-bg-deepest border border-accent-red/30 text-accent-red text-[11px] font-mono animate-fade-in">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="
                  flex items-center justify-center gap-2 py-2.5
                  bg-text-primary text-bg-deepest
                  rounded-lg font-medium text-sm
                  hover:bg-text-secondary active:scale-[0.98]
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="font-mono text-[12px]">{step}</span>
                  </>
                ) : (
                  <>
                    <span>Launch</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
