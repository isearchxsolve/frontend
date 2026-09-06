import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  AppState,
  ChatMessage,
  ExecutionStep,
  SandboxSession,
  BackgroundProcess,
  LogEntry,
  FileNode,
  TerminalState,
  TerminalLine,
  PreviewState,
  WebSocketMessage,
  LeftPanelTab,
  RightPanelTab,
} from "@/types";

interface StoreActions {
  // Chat
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setStreaming: (streaming: boolean) => void;
  addExecutionStep: (step: ExecutionStep) => void;
  updateExecutionStep: (id: string, updates: Partial<ExecutionStep>) => void;
  clearExecutionSteps: () => void;
  
  // Sandbox
  setCurrentSession: (session: SandboxSession | undefined) => void;
  addSession: (session: SandboxSession) => void;
  updateSession: (id: string, updates: Partial<SandboxSession>) => void;
  removeSession: (id: string) => void;
  addProcess: (sessionId: string, process: BackgroundProcess) => void;
  updateProcess: (sessionId: string, processId: string, updates: Partial<BackgroundProcess>) => void;
  addLogEntry: (sessionId: string, processId: string, log: LogEntry) => void;
  
  // Files
  setFileTree: (tree: FileNode[]) => void;
  updateFileNode: (path: string, updates: Partial<FileNode>) => void;
  addFileNode: (parentPath: string, node: FileNode) => void;
  removeFileNode: (path: string) => void;
  setOpenFiles: (files: Map<string, FileNode>) => void;
  openFile: (file: FileNode) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | undefined) => void;
  updateFileContent: (path: string, content: string) => void;
  
  // Terminal
  setTerminalConnected: (connected: boolean, sessionId?: string) => void;
  addTerminalLine: (line: TerminalLine) => void;
  clearTerminalHistory: () => void;
  setTerminalCursor: (position: { x: number; y: number }) => void;
  
  // Preview
  setPreviewUrl: (url: string | undefined) => void;
  setPreviewLoading: (loading: boolean) => void;
  setPreviewError: (error: string | undefined) => void;
  setPreviewDevice: (device: PreviewState["device"]) => void;
  setPreviewZoom: (zoom: number) => void;
  
  // UI
  setLeftPaneWidth: (width: number) => void;
  setRightPaneWidth: (width: number) => void;
  setActiveLeftTab: (tab: LeftPanelTab) => void;
  setActiveRightTab: (tab: RightPanelTab) => void;
  
  // WebSocket
  handleWSMessage: (message: WebSocketMessage) => void;
}

const initialState: AppState = {
  messages: [],
  isStreaming: false,
  currentExecutionSteps: [],
  currentSession: undefined,
  sessions: [],
  fileTree: [],
  openFiles: new Map(),
  activeFilePath: undefined,
  terminal: {
    isConnected: false,
    history: [],
    cursorPosition: { x: 0, y: 0 },
  },
  preview: {
    isLoading: false,
    device: "desktop",
    zoom: 1,
  },
  leftPaneWidth: 50,
  rightPaneWidth: 50,
  activeRightTab: "preview",
};

export const useAppStore = create<AppState & StoreActions>()(
  immer((set) => ({
    ...initialState,
    
    // Chat
    addMessage: (message: ChatMessage) =>
      set((state) => {
        state.messages.push(message);
      }),
    
    updateMessage: (id: string, updates: Partial<ChatMessage>) =>
      set((state) => {
        const idx = state.messages.findIndex((m: ChatMessage) => m.id === id);
        if (idx !== -1) {
          Object.assign(state.messages[idx], updates);
        }
      }),
    
    setStreaming: (streaming: boolean) =>
      set((state) => {
        state.isStreaming = streaming;
      }),
    
    addExecutionStep: (step: ExecutionStep) =>
      set((state) => {
        state.currentExecutionSteps.push(step);
      }),
    
    updateExecutionStep: (id: string, updates: Partial<ExecutionStep>) =>
      set((state) => {
        const idx = state.currentExecutionSteps.findIndex((s: ExecutionStep) => s.id === id);
        if (idx !== -1) {
          Object.assign(state.currentExecutionSteps[idx], updates);
        }
      }),
    
    clearExecutionSteps: () =>
      set((state) => {
        state.currentExecutionSteps = [];
      }),
    
    // Sandbox
    setCurrentSession: (session: SandboxSession | undefined) =>
      set((state) => {
        state.currentSession = session;
      }),
    
    addSession: (session: SandboxSession) =>
      set((state) => {
        state.sessions.push(session);
      }),
    
    updateSession: (id: string, updates: Partial<SandboxSession>) =>
      set((state) => {
        const idx = state.sessions.findIndex((s: SandboxSession) => s.id === id);
        if (idx !== -1) {
          Object.assign(state.sessions[idx], updates);
        }
      }),
    
    removeSession: (id: string) =>
      set((state) => {
        state.sessions = state.sessions.filter((s: SandboxSession) => s.id !== id);
        if (state.currentSession?.id === id) {
          state.currentSession = undefined;
        }
      }),
    
    addProcess: (sessionId: string, process: BackgroundProcess) =>
      set((state) => {
        const session = state.sessions.find((s: SandboxSession) => s.id === sessionId);
        if (session) {
          session.processes.push(process);
        }
        if (state.currentSession?.id === sessionId) {
          state.currentSession.processes.push(process);
        }
      }),
    
    updateProcess: (sessionId: string, processId: string, updates: Partial<BackgroundProcess>) =>
      set((state) => {
        const session = state.sessions.find((s: SandboxSession) => s.id === sessionId);
        if (session) {
          const idx = session.processes.findIndex((p: BackgroundProcess) => p.id === processId);
          if (idx !== -1) {
            Object.assign(session.processes[idx], updates);
          }
        }
        if (state.currentSession?.id === sessionId) {
          const idx = state.currentSession.processes.findIndex((p: BackgroundProcess) => p.id === processId);
          if (idx !== -1) {
            Object.assign(state.currentSession.processes[idx], updates);
          }
        }
      }),
    
    addLogEntry: (sessionId: string, processId: string, log: LogEntry) =>
      set((state) => {
        const session = state.sessions.find((s: SandboxSession) => s.id === sessionId);
        if (session) {
          const process = session.processes.find((p: BackgroundProcess) => p.id === processId);
          if (process) {
            process.logs.push(log);
          }
        }
        if (state.currentSession?.id === sessionId) {
          const process = state.currentSession.processes.find((p: BackgroundProcess) => p.id === processId);
          if (process) {
            process.logs.push(log);
          }
        }
      }),
    
    // Files
    setFileTree: (tree: FileNode[]) =>
      set((state) => {
        state.fileTree = tree;
      }),
    
    updateFileNode: (path: string, updates: Partial<FileNode>) =>
      set((state) => {
        const findAndUpdate = (nodes: FileNode[]): boolean => {
          for (const node of nodes) {
            if (node.path === path) {
              Object.assign(node, updates);
              return true;
            }
            if (node.children && findAndUpdate(node.children)) {
              return true;
            }
          }
          return false;
        };
        findAndUpdate(state.fileTree);
      }),
    
    addFileNode: (parentPath: string, node: FileNode) =>
      set((state) => {
        const findAndAdd = (nodes: FileNode[]): boolean => {
          for (const n of nodes) {
            if (n.path === parentPath) {
              if (!n.children) n.children = [];
              n.children.push(node);
              return true;
            }
            if (n.children && findAndAdd(n.children)) {
              return true;
            }
          }
          return false;
        };
        if (parentPath === "/") {
          state.fileTree.push(node);
        } else {
          findAndAdd(state.fileTree);
        }
      }),
    
    removeFileNode: (path: string) =>
      set((state) => {
        const findAndRemove = (nodes: FileNode[]): boolean => {
          const idx = nodes.findIndex((n: FileNode) => n.path === path);
          if (idx !== -1) {
            nodes.splice(idx, 1);
            return true;
          }
          for (const n of nodes) {
            if (n.children && findAndRemove(n.children)) {
              return true;
            }
          }
          return false;
        };
        findAndRemove(state.fileTree);
      }),
    
    setOpenFiles: (files: Map<string, FileNode>) =>
      set((state) => {
        state.openFiles = files;
      }),
    
    openFile: (file: FileNode) =>
      set((state) => {
        state.openFiles.set(file.path, file);
        state.activeFilePath = file.path;
      }),
    
    closeFile: (path: string) =>
      set((state) => {
        state.openFiles.delete(path);
        if (state.activeFilePath === path) {
          const remaining = Array.from(state.openFiles.values()) as FileNode[];
          state.activeFilePath = remaining.length > 0 ? (remaining[remaining.length - 1] as FileNode).path : undefined;
        }
      }),
    
    setActiveFile: (path: string | undefined) =>
      set((state) => {
        state.activeFilePath = path;
      }),
    
    updateFileContent: (path: string, content: string) =>
      set((state) => {
        const file = state.openFiles.get(path);
        if (file) {
          file.content = content;
          file.isDirty = true;
        }
        const findAndUpdate = (nodes: FileNode[]): boolean => {
          for (const node of nodes) {
            if (node.path === path) {
              node.content = content;
              node.isDirty = true;
              return true;
            }
            if (node.children && findAndUpdate(node.children)) {
              return true;
            }
          }
          return false;
        };
        findAndUpdate(state.fileTree);
      }),
    
    // Terminal
    setTerminalConnected: (connected: boolean, sessionId?: string) =>
      set((state) => {
        state.terminal.isConnected = connected;
        if (sessionId) {
          state.terminal.sessionId = sessionId;
        }
        if (!connected) {
          state.terminal.history = [];
        }
      }),
    
    addTerminalLine: (line: TerminalLine) =>
      set((state) => {
        state.terminal.history.push(line);
        if (state.terminal.history.length > 10000) {
          state.terminal.history = state.terminal.history.slice(-5000);
        }
      }),
    
    clearTerminalHistory: () =>
      set((state) => {
        state.terminal.history = [];
      }),
    
    setTerminalCursor: (position: { x: number; y: number }) =>
      set((state) => {
        state.terminal.cursorPosition = position;
      }),
    
    // Preview
    setPreviewUrl: (url: string | undefined) =>
      set((state) => {
        state.preview.url = url;
      }),
    
    setPreviewLoading: (loading: boolean) =>
      set((state) => {
        state.preview.isLoading = loading;
      }),
    
    setPreviewError: (error: string | undefined) =>
      set((state) => {
        state.preview.error = error;
      }),
    
    setPreviewDevice: (device: PreviewState["device"]) =>
      set((state) => {
        state.preview.device = device;
      }),
    
    setPreviewZoom: (zoom: number) =>
      set((state) => {
        state.preview.zoom = Math.max(0.25, Math.min(2, zoom));
      }),
    
    // UI
    setLeftPaneWidth: (width: number) =>
      set((state) => {
        state.leftPaneWidth = Math.max(20, Math.min(80, width));
      }),
    
    setRightPaneWidth: (width: number) =>
      set((state) => {
        state.rightPaneWidth = Math.max(20, Math.min(80, width));
      }),
    
    setActiveLeftTab: (tab: LeftPanelTab) =>
      set((state) => {
        // Store in localStorage or extend state if needed
      }),
    
    setActiveRightTab: (tab: RightPanelTab) =>
      set((state) => {
        state.activeRightTab = tab;
      }),
    
    // WebSocket
    handleWSMessage: (message: WebSocketMessage) =>
      set((state) => {
        switch (message.type) {
          case "log:stdout":
          case "log:stderr": {
            const payload = message.payload as LogEntry & { processId?: string };
            if (payload.processId && message.sessionId) {
              state.addLogEntry(message.sessionId, payload.processId, payload as LogEntry);
            }
            break;
          }
          case "process:started": {
            const payload = message.payload as BackgroundProcess;
            if (message.sessionId) {
              state.addProcess(message.sessionId, payload);
            }
            break;
          }
          case "process:stopped":
          case "process:error": {
            const payload = message.payload as BackgroundProcess & { exitCode?: number; error?: string };
            if (message.sessionId && payload.id) {
              state.updateProcess(message.sessionId, payload.id, {
                status: message.type === "process:stopped" ? "stopped" : "crashed",
              });
            }
            break;
          }
          case "container:started": {
            if (message.sessionId) {
              state.updateSession(message.sessionId, { status: "running" });
              if (state.currentSession?.id === message.sessionId) {
                state.currentSession.status = "running";
              }
            }
            break;
          }
          case "container:stopped": {
            const payload = message.payload as { exitCode?: number };
            if (message.sessionId) {
              state.updateSession(message.sessionId, { status: "stopped" });
            }
            break;
          }
          case "file:created":
          case "file:updated":
          case "file:deleted":
          case "file:moved": {
            // File tree updates would come via VFS sync
            break;
          }
        }
      }),
  }))
);