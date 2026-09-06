"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { ChatMessage } from "@/types";

export function ChatPanel() {
  const { messages, isStreaming, addMessage, updateMessage, setStreaming } = useAppStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInput("");
    setStreaming(true);

    // Simulate agent response
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      metadata: { executionSteps: [] },
    };

    addMessage(assistantMessage);

    // Simulate streaming response
    const fullResponse = `I will help you with that. Let me start by creating a plan and then implementing it step by step.`;

    let currentContent = "";
    for (const char of fullResponse) {
      currentContent += char;
      updateMessage(assistantMessage.id, { content: currentContent });
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    setStreaming(false);
  }, [input, isStreaming, addMessage, updateMessage, setStreaming]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="text-6xl mb-4">??</div>
            <p className="text-lg font-medium">Welcome to Emergent.sh Clone</p>
            <p className="text-sm mt-1">Start a conversation to build your application</p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.role === "user"
                  ? "bg-blue-100 text-blue-600"
                  : message.role === "assistant"
                  ? "bg-purple-100 text-purple-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {message.role === "user" ? "??" : message.role === "assistant" ? "??" : "?"}
            </div>
            <div
              className={`max-w-[75%] ${
                message.role === "user" ? "text-right" : ""
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-2xl text-sm ${
                  message.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-none"
                    : message.role === "assistant"
                    ? "bg-white text-gray-900 border border-gray-200 rounded-tl-none"
                    : "bg-gray-100 text-gray-700 rounded-tl-none"
                } whitespace-pre-wrap`}
              >
                {message.content}
              </div>
              <div className="text-xs text-gray-400 mt-1 px-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStreaming ? "Waiting for response..." : "Type your message..."}
            disabled={isStreaming}
            className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-[120px]"
            rows={1}
            style={{ lineHeight: "1.5" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? "?" : "?"}
          </button>
        </div>
      </form>
    </div>
  );
}