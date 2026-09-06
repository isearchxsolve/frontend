"use client";

import { useAppStore } from "@/store/useAppStore";
import type { ExecutionStep } from "@/types";

export function ExecutionPanel() {
  const { currentExecutionSteps, updateExecutionStep } = useAppStore();

  const getStepIcon = (type: ExecutionStep["type"]) => {
    switch (type) {
      case "thinking": return "💭";
      case "tool_call": return "🔧";
      case "tool_result": return "📋";
      case "code_generation": return "💻";
      case "file_operation": return "📁";
      default: return "❓";
    }
  };

  const getStatusColor = (status: ExecutionStep["status"]) => {
    switch (status) {
      case "pending": return "text-gray-400";
      case "running": return "text-blue-500 animate-pulse";
      case "completed": return "text-green-500";
      case "failed": return "text-red-500";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (status: ExecutionStep["status"]) => {
    switch (status) {
      case "pending": return "⏳";
      case "running": return "⚡";
      case "completed": return "✅";
      case "failed": return "❌";
      default: return "❓";
    }
  };

  const formatOutput = (output: unknown): string => {
    if (typeof output === "string") return output;
    if (output === null || output === undefined) return "";
    try {
      return JSON.stringify(output, null, 2);
    } catch {
      return String(output);
    }
  };

  if (currentExecutionSteps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
        <div className="text-6xl mb-4">⏳</div>
        <p className="text-lg font-medium">No Active Execution</p>
        <p className="text-sm mt-1">Start a task in chat to see execution steps</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
        <h3 className="font-semibold text-gray-900">Execution Steps</h3>
        <span className="text-xs text-gray-500">{currentExecutionSteps.length} steps</span>
      </div>
      
      <div className="space-y-3">
        {currentExecutionSteps.map((step) => {
          const output = step.output ? formatOutput(step.output) : null;
          return (
            <div
              key={step.id}
              className={`bg-white border rounded-lg p-3 transition-all ${
                step.status === "running" ? "border-blue-300 bg-blue-50" :
                step.status === "completed" ? "border-green-200" :
                step.status === "failed" ? "border-red-200 bg-red-50" :
                "border-gray-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1">
                  <span className={getStatusColor(step.status)}>{getStatusIcon(step.status)}</span>
                  <div className="w-0.5 h-8 bg-gray-200" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStepIcon(step.type)}</span>
                    <h4 className="font-medium text-gray-900">{step.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(step.status).replace("text-", "bg-").replace("500", "100").replace("animate-pulse", "")} text-gray-700`}>
                      {step.status}
                    </span>
                  </div>
                  
                  {step.description && (
                    <p className="mt-1 text-sm text-gray-600 ml-6">{step.description}</p>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500 ml-6 flex items-center gap-2">
                    <span>Started: {step.startTime.toLocaleTimeString()}</span>
                    {step.endTime && <span>Ended: {step.endTime.toLocaleTimeString()}</span>}
                    {step.duration && <span>Duration: {step.duration}ms</span>}
                  </div>
                  
                  {output && (
                    <details className="mt-2 ml-6">
                      <summary className="text-xs text-blue-600 cursor-pointer">Show Output</summary>
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto text-gray-700 max-h-40">
                        {output as string}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
