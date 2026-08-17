/**
 * CodeViewer — Syntax-highlighted code display with line numbers.
 */
import { Loader2 } from "lucide-react";

export default function CodeViewer({ content, highlightedHtml, filePath, loading }) {
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-deep">
        <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
      </div>
    );
  }

  if (!filePath) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-bg-deep gap-3">
        <div className="text-text-faint text-[11px] font-mono tracking-wide uppercase">
          Select a file to view
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center bg-bg-deep">
        <div className="text-text-muted text-[12px] font-mono">
          No content available
        </div>
      </div>
    );
  }

  const lines = content.split("\n");
  const highlightedLines = highlightedHtml ? highlightedHtml.split("\n") : null;

  return (
    <div className="h-full overflow-auto bg-bg-deep scrollbar-thin">
      <table className="w-full border-collapse font-mono text-[13px] leading-[1.6]">
        <tbody>
          {lines.map((line, i) => (
            <tr key={i} className="hover:bg-bg-hover/50 transition-colors">
              {/* Line number */}
              <td className="px-3 py-0 text-right text-text-faint select-none w-12 align-top sticky left-0 bg-bg-deep">
                {i + 1}
              </td>
              {/* Code content */}
              <td className="px-4 py-0 text-text-secondary whitespace-pre overflow-x-auto">
                {highlightedLines ? (
                  <span
                    dangerouslySetInnerHTML={{ __html: highlightedLines[i] || "" }}
                  />
                ) : (
                  <span>{line}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
