/**
 * TabBar — Horizontal tabs for open files.
 */
import { X } from "lucide-react";

/**
 * Extract file basename from path.
 */
function basename(path) {
  return path.split("/").pop() || path;
}

export default function TabBar({ tabs, activeTab, onSelectTab, onCloseTab }) {
  if (tabs.length === 0) return null;

  return (
    <div className="h-8 flex items-center bg-bg-deep border-b border-border-default overflow-x-auto scrollbar-hidden shrink-0">
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <div
            key={tab}
            className={`
              group flex items-center gap-1.5 h-full px-3 text-[12px] font-mono
              border-r border-border-subtle cursor-pointer select-none shrink-0
              transition-colors duration-100
              ${isActive
                ? "bg-bg-surface text-text-primary border-b-2 border-b-accent-green"
                : "bg-bg-deep text-text-muted hover:text-text-tertiary hover:bg-bg-raised"
              }
            `}
            onClick={() => onSelectTab(tab)}
          >
            <span className="truncate max-w-[120px]">{basename(tab)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab);
              }}
              className={`
                p-0.5 rounded
                transition-colors
                ${isActive
                  ? "text-text-muted hover:text-text-primary hover:bg-bg-hover"
                  : "text-transparent group-hover:text-text-muted hover:!text-text-primary hover:!bg-bg-hover"
                }
              `}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
