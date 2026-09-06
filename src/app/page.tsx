"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { ChatPane } from "@/components/ChatPane";
import { TerminalPane } from "@/components/TerminalPane";
import { Preview } from "@/components/Preview";
import { useStore } from "@/store/useStore";

const MonacoEditor = dynamic(() => import("@/components/MonacoEditor"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full">Loading editor...</div>,
});

export default function Home() {
  const [activeLeftTab, setActiveLeftTab] = useState<"chat" | "terminal" | "steps">("chat");
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "editor" | "inspector">("preview");
  const { setActiveLeftTab: storeSetLeftTab, setActiveRightTab: storeSetRightTab } = useStore();

  useEffect(() => {
    storeSetLeftTab(activeLeftTab);
    storeSetRightTab(activeRightTab);
  }, [activeLeftTab, activeRightTab, storeSetLeftTab, storeSetRightTab]);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Pane - Chat/Terminal/Steps */}
      <div className="flex flex-col w-1/2 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Left Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-2">
          {(["chat", "terminal", "steps"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveLeftTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeLeftTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Left Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeLeftTab === "chat" && <ChatPane />}
          {activeLeftTab === "terminal" && <TerminalPane />}
          {activeLeftTab === "steps" && (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Execution Steps - Coming Soon
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Preview/Editor/Inspector */}
      <div className="flex flex-col w-1/2 bg-white dark:bg-gray-800">
        {/* Right Tab Bar */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-2">
          {(["preview", "editor", "inspector"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeRightTab === tab
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Right Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeRightTab === "preview" && <Preview />}
          {activeRightTab === "editor" && <MonacoEditor />}
          {activeRightTab === "inspector" && (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              Visual Inspector - Coming Soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
