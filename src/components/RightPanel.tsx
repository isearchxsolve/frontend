"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MonacoEditorWrapper } from "./MonacoEditorWrapper";
import { PreviewIframe } from "./PreviewIframe";
import { VisualInspector } from "./VisualInspector";

type RightTab = "preview" | "editor" | "inspector";

interface RightPanelProps {
  activeTab: RightTab;
}

export function RightPanel({ activeTab }: RightPanelProps) {
  const { openFiles, activeFilePath, activeRightTab, setActiveRightTab, preview, setActiveFile, closeFile, updateFileContent } = useAppStore();
  const [editorContent, setEditorContent] = useState("");

  // Sync editor content with active file
  useEffect(() => {
    if (activeFilePath) {
      const file = openFiles.get(activeFilePath);
      if (file?.content !== undefined) {
        setEditorContent(file.content);
      }
    } else {
      setEditorContent("");
    }
  }, [activeFilePath, openFiles]);

  const handleEditorChange = useCallback((content: string) => {
    setEditorContent(content);
    if (activeFilePath) {
      // Update store - in real implementation this would be debounced
      updateFileContent(activeFilePath, content);
    }
  }, [activeFilePath, updateFileContent]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {activeTab === "preview" && (
        <PreviewIframe
          url={preview.url}
          isLoading={preview.isLoading}
          error={preview.error}
          device={preview.device}
          zoom={preview.zoom}
        />
      )}
      
      {activeTab === "editor" && (
        <div className="flex-1 flex flex-col">
          {/* Editor Tab Bar */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-2">
            {Array.from(openFiles.entries()).map(([path, file]) => (
              <button
                key={path}
                onClick={() => setActiveFile(path)}
                className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors flex items-center gap-1.5 ${
                  activeFilePath === path
                    ? "bg-white text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{file.type === "directory" ? "📁" : "📄"}</span>
                <span>{file.name}</span>
                {file.isDirty && <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(path);
                  }}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </button>
            ))}
            {openFiles.size === 0 && (
              <span className="px-3 py-1.5 text-sm text-gray-400">No files open</span>
            )}
          </div>
          
          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            {activeFilePath ? (
              <MonacoEditorWrapper
                content={editorContent}
                onChange={handleEditorChange}
                language={openFiles.get(activeFilePath)?.language || "typescript"}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-medium">No file selected</p>
                <p className="text-sm mt-1">Open a file from the explorer or create a new one</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === "inspector" && (
        <VisualInspector />
      )}
    </div>
  );
}
