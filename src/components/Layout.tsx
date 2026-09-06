"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { ResizableHandle } from "./ResizableHandle";

const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div> }
);

export function Layout() {
  const {
    leftPaneWidth,
    rightPaneWidth,
    setLeftPaneWidth,
    setRightPaneWidth,
    activeRightTab,
    setActiveRightTab,
  } = useAppStore();

  const [leftWidth, setLeftWidth] = useState(leftPaneWidth);
  const [rightWidth, setRightWidth] = useState(rightPaneWidth);

  // Sync with store
  useEffect(() => {
    setLeftWidth(leftPaneWidth);
  }, [leftPaneWidth]);

  useEffect(() => {
    setRightWidth(rightPaneWidth);
  }, [rightPaneWidth]);

  const handleLeftResize = useCallback(
    (width: number) => {
      setLeftWidth(width);
      setLeftPaneWidth(width);
    },
    [setLeftPaneWidth]
  );

  const handleRightResize = useCallback(
    (width: number) => {
      setRightWidth(width);
      setRightPaneWidth(width);
    },
    [setRightPaneWidth]
  );

  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden">
      {/* Left Pane - 50% default */}
      <div
        className="flex flex-col border-r border-gray-200 bg-white"
        style={{ width: `${leftWidth}%`, minWidth: "320px", maxWidth: "80%" }}
      >
        <LeftPanel />
      </div>

      {/* Resizable Handle - Left */}
      <ResizableHandle
        position={leftWidth}
        onDrag={handleLeftResize}
        direction="horizontal"
      />

      {/* Right Pane - 50% default */}
      <div
        className="flex flex-col border-l border-gray-200 bg-white"
        style={{ width: `${rightWidth}%`, minWidth: "320px", maxWidth: "80%" }}
      >
        {/* Right Panel Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-2">
          {[
            { id: "preview", label: "Preview", icon: "??" },
            { id: "editor", label: "Editor", icon: "??" },
            { id: "inspector", label: "Inspector", icon: "??" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveRightTab(tab.id as "preview" | "editor" | "inspector")}
              className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
                activeRightTab === tab.id
                  ? "bg-white text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-1">
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </div>

        <RightPanel activeTab={activeRightTab} />
      </div>

      {/* Resizable Handle - Right */}
      <ResizableHandle
        position={rightWidth}
        onDrag={handleRightResize}
        direction="horizontal"
        reverse
      />
    </div>
  );
}