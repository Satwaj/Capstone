/**
 * TerminalPanel — xterm.js terminal connected via Socket.IO.
 *
 * Mounts the xterm container and calls initTerminal once the DOM ref
 * and agentUrl are both available. A ResizeObserver keeps the terminal
 * fitted to its container whenever the panel is resized.
 */
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import "../../styles/terminal.css";

export default function TerminalPanel({ initTerminal, fitTerminal }) {
  const containerRef = useRef(null);

  // Call initTerminal whenever the ref is available.
  // The hook itself guards against double-init, so this is safe.
  useEffect(() => {
    if (containerRef.current) {
      initTerminal(containerRef.current);
    }
  }, [initTerminal]); // re-runs if initTerminal changes (i.e. agentUrl arrives)

  // ResizeObserver — keep the xterm canvas fitted to its container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      fitTerminal?.();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, [fitTerminal]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#0a0a0a]"
    />
  );
}
