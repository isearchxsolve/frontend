"use client";

import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { useAppStore } from "@/store/useAppStore";

interface MonacoEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  language?: string;
  theme?: "vs" | "vs-dark";
}

export default function MonacoEditor({ 
  content = "", 
  onChange, 
  language = "typescript",
  theme: initialTheme = "vs-dark"
}: MonacoEditorProps) {
  const { 
    activeFilePath, 
    openFiles, 
    setActiveFile, 
    updateFileContent, 
    closeFile 
  } = useAppStore();
  const [currentFile, setCurrentFile] = useState<string>(activeFilePath || "");
  const [fileContent, setFileContent] = useState<string>(content);
  const [theme, setTheme] = useState<"vs" | "vs-dark">(initialTheme);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (content) {
      setFileContent(content);
    }
  }, [content]);

  useEffect(() => {
    // Set default file if none selected
    if (!currentFile && activeFilePath) {
      setCurrentFile(activeFilePath);
      setFileContent("");
    }
  }, [activeFilePath]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && currentFile) {
      setFileContent(value);
      if (onChange) {
        onChange(value);
      } else {
        updateFileContent(currentFile, value);
      }
    }
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Set up auto-save on change
    editor.onDidChangeModelContent(() => {
      const value = editor.getValue();
      if (currentFile) {
        updateFileContent(currentFile, value);
      }
    });
  };

  const fileList = Array.from(openFiles.keys());

  const handleTabClick = (file: string) => {
    setCurrentFile(file);
    setFileContent("");
    setActiveFile(file);
  };

  const handleTabClose = (e: React.MouseEvent, file: string) => {
    e.stopPropagation();
    closeFile(file);
    if (currentFile === file) {
      const remaining = Array.from(openFiles.keys());
      if (remaining.length > 0) {
        const nextFile = remaining[remaining.length - 1];
        if (nextFile) handleTabClick(nextFile);
      } else {
        setCurrentFile("");
        setFileContent("");
        setActiveFile(undefined);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code Editor</span>
          
          {/* File Tabs */}
          <div className="flex gap-1 overflow-x-auto flex-1 min-w-0">
            {fileList.map((file) => (
              <button
                key={file}
                onClick={() => handleTabClick(file)}
                className={`px-3 py-1 text-xs rounded-t transition-colors whitespace-nowrap flex-shrink-0 ${
                  currentFile === file
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 border-b-0"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {file.split("/").pop()}
                <button
                  onClick={(e) => handleTabClose(e, file)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              </button>
            ))}
            {fileList.length === 0 && (
              <span className="px-3 py-1 text-xs text-gray-400 dark:text-gray-500">No files open</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as "vs" | "vs-dark")}
            className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
          >
            <option value="vs">Light</option>
            <option value="vs-dark">Dark</option>
          </select>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 w-full">
        <Editor
          height="100%"
          language={language}
          theme={theme}
          value={fileContent}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: "on",
            wordWrap: "on",
            tabSize: 2,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            autoClosingBrackets: "always",
            autoClosingQuotes: "always",
            formatOnPaste: true,
            formatOnType: true,
            renderLineHighlight: "all",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  );
}
