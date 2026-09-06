"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ChatPanel } from "./ChatPanel";
import { TerminalPanel } from "./TerminalPanel";
import { ExecutionPanel } from "./ExecutionPanel";

type LeftTab = "chat" | "terminal" | "execution";

export function LeftPanel() {
  const { messages, isStreaming, currentExecutionSteps, terminal } = useAppStore();
  const [activeTab, setActiveTab] = useState<LeftTab>("chat");
  const [showExecution, setShowExecution] = useState(false);

  // Auto-switch to execution when streaming starts
  useEffect(() => {
    if (isStreaming && currentExecutionSteps.length > 0) {
      setShowExecution(true);
      setActiveTab("execution");
    }
  }, [isStreaming, currentExecutionSteps.length]);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 bg-gray-50 px-1">
        <button
          onClick={() => { setShowExecution(false); setActiveTab("chat"); }}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-t transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "chat" && !showExecution
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>??</span>
          <span>Chat</span>
          {isStreaming && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
        </button>
        
        <button
          onClick={() => { setShowExecution(false); setActiveTab("terminal"); }}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-t transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === "terminal"
              ? "bg-white text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>?</span>
          <span>Terminal</span>
          {terminal.isConnected && <span className="w-2 h-2 bg-green-500 rounded-full" />}
        </button>
        
        {showExecution && (
          <button
            onClick={() => setActiveTab("execution")}
            className="flex-1 px-3 py-2 text-sm font-medium rounded-t transition-colors flex items-center justify-center gap-1.5 bg-white text-orange-600 border-b-2 border-orange-600"
          >
            <span>?</span>
            <span>Execution</span>
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </button>
        )}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && !showExecution && <ChatPanel />}
        {activeTab === "terminal" && <TerminalPanel />}
        {(activeTab === "execution" || showExecution) && <ExecutionPanel />}
      </div>
    </div>
  );
}