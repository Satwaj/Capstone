/**
 * AI Service — SSE streaming for AI invocations.
 */

/**
 * Invoke the AI with a message and stream the response via SSE.
 *
 * @param {string}   message    – User prompt
 * @param {string}   projectId  – Sandbox / project ID
 * @param {object}   callbacks
 * @param {function} callbacks.onMessage  – called for each SSE chunk
 * @param {function} callbacks.onError    – called on error
 * @param {function} callbacks.onComplete – called when stream ends
 * @returns {function} abort – call to cancel the stream
 */
export function invokeAI(message, projectId, { onMessage, onError, onComplete }) {
  const controller = new AbortController();

  (async () => {
    try {
      const response = await fetch("/api/ai/invoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, projectId }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI API Error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // SSE format: each line may contain data
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          // Handle SSE "data:" prefix if present
          const text = line.startsWith("data:") ? line.slice(5).trim() : line;
          if (text) {
            onMessage?.(text);
          }
        }
      }

      onComplete?.();
    } catch (err) {
      if (err.name !== "AbortError") {
        onError?.(err);
      }
    }
  })();

  return () => controller.abort();
}
