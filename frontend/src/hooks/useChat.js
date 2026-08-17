/**
 * useChat — AI chat messages with SSE streaming.
 */
import { useState, useCallback, useRef } from "react";
import { invokeAI } from "../services/aiService";

export function useChat(sandboxId) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !sandboxId || streaming) return;

      // Add user message
      const userMsg = {
        id: Date.now(),
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);
      setStreamingText("");

      let fullResponse = "";

      // Start SSE stream
      const abort = invokeAI(text.trim(), sandboxId, {
        onMessage: (chunk) => {
          fullResponse += chunk + "\n";
          setStreamingText(fullResponse);
        },
        onError: (err) => {
          console.error("AI stream error:", err);
          const errorMsg = {
            id: Date.now() + 1,
            role: "assistant",
            content: `Error: ${err.message}`,
            timestamp: new Date(),
            isError: true,
          };
          setMessages((prev) => [...prev, errorMsg]);
          setStreaming(false);
          setStreamingText("");
        },
        onComplete: () => {
          if (fullResponse.trim()) {
            const aiMsg = {
              id: Date.now() + 1,
              role: "assistant",
              content: fullResponse.trim(),
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
          }
          setStreaming(false);
          setStreamingText("");
        },
      });

      abortRef.current = abort;
    },
    [sandboxId, streaming]
  );

  const cancelStream = useCallback(() => {
    if (abortRef.current) {
      abortRef.current();
      setStreaming(false);
      setStreamingText("");
    }
  }, []);

  return {
    messages,
    streaming,
    streamingText,
    sendMessage,
    cancelStream,
  };
}
