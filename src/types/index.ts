/**
 * Frontend Type Definitions
 * Shared types for the dual-pane Emergent.sh clone UI
 */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  metadata?: {
    executionSteps?: ExecutionStep[];
    filesChanged?: string[];
  };
}

export interface ExecutionStep {
  id: string;
  type: "thinking" | "tool_call" | "tool_result" | "code_generation" | "file_operation";
  title: string;
  description?: string;
  status: "pending" | "running" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: unknown;
}

export interface SandboxSession {
  id: string;
  userId: string;
  projectId: string;
  status: "creating" | "starting" | "running" | "stopping" | "stopped" | "error";
  containerId?: string;
  ports: Map<number, number>;
  processes: BackgroundProcess[];
  createdAt: Date;
  updatedAt: Date;
}

export interface BackgroundProcess {
  id: string;
  command: string[];
  workingDir: string;
  status: "starting" | "running" | "stopping" | "stopped" | "crashed";
  pid?: number;
  port?: number;
  startedAt: Date;
  logs: LogEntry[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  stream: "stdout" | "stderr";
  data: string;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  content?: string;
  language?: string;
  isOpen?: boolean;
  isActive?: boolean;
  isDirty?: boolean;
}

export interface TerminalState {
  isConnected: boolean;
  sessionId?: string;
  history: TerminalLine[];
  cursorPosition: { x: number; y: number };
}

export interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "prompt";
  content: string;
  timestamp: Date;
}

export interface PreviewState {
  url?: string;
  isLoading: boolean;
  error?: string;
  device: "desktop" | "tablet" | "mobile";
  zoom: number;
}

export interface AppState {
  // Chat
  messages: ChatMessage[];
  isStreaming: boolean;
  currentExecutionSteps: ExecutionStep[];
  
  // Sandbox
  currentSession?: SandboxSession;
  sessions: SandboxSession[];
  
  // Files
  fileTree: FileNode[];
  openFiles: Map<string, FileNode>;
  activeFilePath?: string;
  
  // Terminal
  terminal: TerminalState;
  
  // Preview
  preview: PreviewState;
  
  // UI
  leftPaneWidth: number;
  rightPaneWidth: number;
  activeRightTab: "preview" | "editor" | "inspector";
}

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: Date;
  id: string;
  sessionId?: string;
}

export type LeftPanelTab = "chat" | "terminal" | "execution";
export type RightPanelTab = "preview" | "editor" | "inspector";
