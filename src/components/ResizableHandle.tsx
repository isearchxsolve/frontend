"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ResizableHandleProps {
  position: number;
  onDrag: (position: number) => void;
  direction: "horizontal" | "vertical";
  reverse?: boolean;
  min?: number;
  max?: number;
}

export function ResizableHandle({
  position,
  onDrag,
  direction,
  reverse = false,
  min = 10,
  max = 90,
}: ResizableHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef(position);
  const startClientRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      startPositionRef.current = position;
      startClientRef.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
    },
    [position, direction]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = direction === "horizontal" ? e.clientX - startClientRef.current.x : e.clientY - startClientRef.current.y;
      const containerSize = direction === "horizontal" ? window.innerWidth : window.innerHeight;
      const deltaPercent = (delta / containerSize) * 100;
      
      let newPosition = reverse ? startPositionRef.current - deltaPercent : startPositionRef.current + deltaPercent;
      newPosition = Math.max(min, Math.min(max, newPosition));
      
      onDrag(newPosition);
    },
    [isDragging, direction, reverse, min, max, onDrag]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className={`relative z-10 transition-colors ${
        direction === "horizontal"
          ? "w-1 h-full cursor-col-resize hover:bg-blue-200"
          : "h-1 w-full cursor-row-resize hover:bg-blue-200"
      } ${isDragging ? "bg-blue-300" : "bg-transparent"}`}
      aria-label="Resize panel"
      role="separator"
      tabIndex={0}
    >
      {/* Visual indicator */}
      <div
        className={`absolute ${direction === "horizontal" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"}`}
        style={{
          width: direction === "horizontal" ? "24px" : "4px",
          height: direction === "horizontal" ? "4px" : "24px",
          backgroundColor: isDragging ? "rgb(59 130 246)" : "rgb(209 213 219)",
          borderRadius: "2px",
          transition: "all 0.1s ease",
        }}
      />
    </div>
  );
}