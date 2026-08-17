/**
 * useTerminal — xterm.js + Socket.IO terminal.
 *
 * Socket connects via /terminal-proxy/{sandboxId}/socket.io/ through Vite proxy.
 */
import { useRef, useEffect, useCallback } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import {
  createTerminalSocket,
  sendTerminalInput,
  onTerminalOutput,
  disconnectSocket,
} from "../services/socketService";

const THEME = {
  background:          "#0a0a0a",
  foreground:          "#e0e0e0",
  cursor:              "#e0e0e0",
  cursorAccent:        "#0a0a0a",
  selectionBackground: "rgba(255,255,255,0.15)",
  black:   "#0a0a0a", red:     "#ef4444", green:   "#22c55e", yellow: "#f59e0b",
  blue:    "#a0a0a0", magenta: "#a0a0a0", cyan:    "#a0a0a0", white:  "#e0e0e0",
  brightBlack:   "#666666", brightRed:     "#f87171", brightGreen:   "#4ade80",
  brightYellow:  "#fbbf24", brightBlue:    "#c0c0c0", brightMagenta: "#c0c0c0",
  brightCyan:    "#c0c0c0", brightWhite:   "#ffffff",
};

export function useTerminal(sandboxId) {
  const termRef    = useRef(null);
  const fitRef     = useRef(null);
  const initedRef  = useRef(false);

  const initTerminal = useCallback((el) => {
    if (!el || !sandboxId || initedRef.current) return;
    initedRef.current = true;

    const term = new Terminal({
      theme: THEME,
      fontFamily: '"JetBrains Mono", "Cascadia Code", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: "bar",
      scrollback: 5000,
      convertEol: true,
      allowProposedApi: true,
    });

    const fit  = new FitAddon();
    const wla  = new WebLinksAddon();
    term.loadAddon(fit);
    term.loadAddon(wla);
    term.open(el);

    requestAnimationFrame(() => {
      try { fit.fit(); } catch { /* ignore */ }
      term.focus();
    });

    termRef.current = term;
    fitRef.current  = fit;

    // Connect via proxy
    createTerminalSocket(sandboxId);

    term.onData((data) => sendTerminalInput(data));
    onTerminalOutput((data) => term.write(data));
  }, [sandboxId]);

  const fitTerminal = useCallback(() => {
    try { fitRef.current?.fit(); } catch { /* ignore */ }
  }, []);

  useEffect(() => () => {
    termRef.current?.dispose();
    termRef.current  = null;
    fitRef.current   = null;
    initedRef.current = false;
    disconnectSocket();
  }, []);

  return { initTerminal, fitTerminal };
}
