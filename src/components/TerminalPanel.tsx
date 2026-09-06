"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { TerminalLine } from "@/types";

export function TerminalPanel() {
  const { terminal, setTerminalConnected, addTerminalLine, clearTerminalHistory } = useAppStore();
  const terminalRef = useRef<HTMLDivElement>(null);
  const [wsUrl, setWsUrl] = useState("ws://localhost:8080");
  const [sessionId, setSessionId] = useState("");

  // In a real implementation, this would use the WebSocketClient from @/lib/websocket
  // For now, we simulate a terminal

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputLine = terminalRef.current?.querySelector(".terminal-input") as HTMLInputElement;
      if (inputLine && inputLine.value.trim()) {
        const command = inputLine.value;
        addTerminalLine({
          id: crypto.randomUUID(),
          type: "input",
          content: `$ ${command}`,
          timestamp: new Date(),
        });
        inputLine.value = "";
        
        // Simulate command output
        setTimeout(() => {
          addTerminalLine({
            id: crypto.randomUUID(),
            type: "output",
            content: `Executing: ${command}...`,
            timestamp: new Date(),
          });
        }, 100);
      }
    }
  }, [addTerminalLine]);

  const handleConnect = useCallback(() => {
    if (!sessionId.trim()) return;
    setTerminalConnected(true, sessionId);
    addTerminalLine({
      id: crypto.randomUUID(),
      type: "output",
      content: `Connected to session: ${sessionId}`,
      timestamp: new Date(),
    });
  }, [sessionId, setTerminalConnected, addTerminalLine]);

  const handleDisconnect = useCallback(() => {
    setTerminalConnected(false);
    clearTerminalHistory();
  }, [setTerminalConnected, clearTerminalHistory]);

  return (
    <div className="flex flex-col h-full bg-black">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${terminal.isConnected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-xs text-gray-400 font-mono">terminal</span>
          {terminal.sessionId && (
            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-800 rounded">
              {terminal.sessionId.slice(0, 8)}
            </span>
          )}
        </div>
        <div className="flex-1" />
        {!terminal.isConnected ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Session ID"
              className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
            />
            <button
              onClick={handleConnect}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Connect
            </button>
          </div>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Disconnect
          </button>
        )}
      </div>

      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm text-green-300"
        style={{ lineHeight: "1.6" }}
      >
        {terminal.history.length === 0 && (
          <div className="text-gray-500">
            <p>Welcome to the Emergent.sh Terminal</p>
            <p className="mt-1">Enter a session ID and click Connect to start</p>
          </div>
        )}
        {terminal.history.map((line) => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap break-all ${
              line.type === "input" ? "text-yellow-300" :
              line.type === "error" ? "text-red-400" :
              "text-green-300"
            }`}
          >
            {line.content}
          </div>
        ))}
        <div className="flex items-baseline gap-1">
          <span className="text-gray-500">$</span>
          <input
            className="flex-1 bg-transparent border-none text-green-300 focus:outline-none text-sm font-mono terminal-input"
            type="text"
            onKeyDown={handleKeyDown}
            autoFocus
            disabled={!terminal.isConnected}
            placeholder={terminal.isConnected ? "" : "Connect to a session first"}
          />
        </div>
      </div>
    </div>
  );
}
