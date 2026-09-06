"use client";

import { useRef, useEffect, useCallback } from "react";
import Editor from "@monaco-editor/react";

interface MonacoEditorWrapperProps {
  content: string;
  onChange: (content: string) => void;
  language?: string;
  theme?: "vs-dark" | "vs" | "hc-black";
}

export function MonacoEditorWrapper({
  content,
  onChange,
  language = "typescript",
  theme = "vs-dark",
}: MonacoEditorWrapperProps) {
  const editorRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  const handleEditorDidMount = useCallback((editor: any) => {
    editorRef.current = editor;
    isInitializedRef.current = true;
    
    // Configure editor
    editor.updateOptions({
      minimap: { enabled: true },
      lineNumbers: "on",
      folding: true,
      wordWrap: "on",
      tabSize: 2,
      formatOnPaste: true,
      formatOnType: true,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: "smooth",
      renderWhitespace: "selection",
    });
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value);
    }
  }, [onChange]);

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      defaultValue={content}
      theme={theme}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: true },
        lineNumbers: "on",
        folding: true,
        wordWrap: "on",
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        renderWhitespace: "selection",
      }}
    />
  );
}
