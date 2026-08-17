/**
 * PanelResizer — Draggable divider for resizing panels.
 */
import { useCallback, useRef, useEffect } from "react";

/**
 * @param {"horizontal"|"vertical"} direction
 * @param {function} onResize – called with delta pixels
 * @param {string}   className – additional classes
 */
export default function PanelResizer({ direction = "horizontal", onResize, className = "" }) {
  const dragging = useRef(false);
  const lastPos = useRef(0);

  const isHorizontal = direction === "horizontal";

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      dragging.current = true;
      lastPos.current = isHorizontal ? e.clientX : e.clientY;
      document.body.style.cursor = isHorizontal ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    },
    [isHorizontal]
  );

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging.current) return;
      const currentPos = isHorizontal ? e.clientX : e.clientY;
      const delta = currentPos - lastPos.current;
      lastPos.current = currentPos;
      onResize?.(delta);
    };

    const handleMouseUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isHorizontal, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        ${isHorizontal ? "w-[3px] cursor-col-resize" : "h-[3px] cursor-row-resize"}
        bg-border-default hover:bg-border-hover active:bg-accent-green
        transition-colors duration-150 shrink-0 z-10
        ${className}
      `}
    />
  );
}
