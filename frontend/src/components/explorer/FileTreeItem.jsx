/**
 * FileTreeItem — Individual tree node (file or folder) in the explorer.
 */
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";

/**
 * Get a file-type icon color based on extension.
 */
function getFileColor(name) {
  const ext = name.split(".").pop()?.toLowerCase();
  const colors = {
    jsx: "text-text-tertiary",
    js: "text-text-tertiary",
    tsx: "text-text-tertiary",
    ts: "text-text-tertiary",
    css: "text-text-tertiary",
    html: "text-text-tertiary",
    json: "text-text-muted",
    md: "text-text-muted",
    svg: "text-text-muted",
    png: "text-text-muted",
    yml: "text-text-muted",
    yaml: "text-text-muted",
  };
  return colors[ext] || "text-text-muted";
}

export default function FileTreeItem({
  node,
  depth = 0,
  expandedFolders,
  selectedFile,
  onToggleFolder,
  onSelectFile,
  sortChildren,
}) {
  const isFolder = node.type === "folder";
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;

  const handleClick = () => {
    if (isFolder) {
      onToggleFolder(node.path);
    } else {
      onSelectFile(node.path);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-1.5 py-[3px] pr-3 text-left
          text-[12px] font-mono leading-tight
          transition-colors duration-100 group
          ${isSelected
            ? "bg-bg-active text-text-primary"
            : "text-text-tertiary hover:bg-bg-hover hover:text-text-secondary"
          }
        `}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        {isFolder ? (
          <>
            <ChevronRight
              className={`w-3 h-3 shrink-0 transition-transform duration-150 text-text-muted
                ${isExpanded ? "rotate-90" : ""}`}
            />
            {isExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 shrink-0 text-text-tertiary" />
            ) : (
              <Folder className="w-3.5 h-3.5 shrink-0 text-text-muted" />
            )}
          </>
        ) : (
          <>
            <span className="w-3 shrink-0" />
            <File className={`w-3.5 h-3.5 shrink-0 ${getFileColor(node.name)}`} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {/* Render children if folder is expanded */}
      {isFolder && isExpanded && node.children && (
        <div>
          {sortChildren(node.children).map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedFolders={expandedFolders}
              selectedFile={selectedFile}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              sortChildren={sortChildren}
            />
          ))}
        </div>
      )}
    </div>
  );
}
