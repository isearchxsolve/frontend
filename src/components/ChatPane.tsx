"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";

export function ChatPane() {
  const { messages, addMessage, clearMessages, sessionId, connected } = useStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket(`ws://localhost:34567/stream`);
    wsRef.current = ws;

    ws.onopen = () => {
      useStore.getState().setConnected(true);
      addMessage({ role: "system", content: "Connected to Emergent agent" });
    };

    ws.onclose = () => {
      useStore.getState().setConnected(false);
      addMessage({ role: "system", content: "Disconnected from agent" });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "agent_message") {
          addMessage({ role: "assistant", content: data.payload.content });
        } else if (data.type === "execution_step") {
          addMessage({ role: "system", content: `Step: ${data.payload.step}` });
        }
      } catch {
        // Ignore parse errors
      }
    };

    ws.onerror = () => {
      addMessage({ role: "system", content: "Connection error" });
    };

    return () => {
      ws.close();
    };
  }, [addMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage({ role: "user", content: input });
    
    // Send to WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "user_message",
        payload: { content: input }
      }));
    }

    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Connection Status */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {connected ? "Connected" : "Disconnected"}
        </span>
        {sessionId && (
          <span className="text-xs text-gray-400 ml-auto">{sessionId.slice(0, 8)}...</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : msg.role === "assistant"
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
                  : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-sm"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-xs opacity-70 mt-1 text-right">
                {msg.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!connected}
          />
          <button
            type="submit"
            disabled={!input.trim() || !connected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
