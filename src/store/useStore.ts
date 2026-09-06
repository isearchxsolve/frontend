import { create } from "zustand";

interface AppState {
  // Active tabs
  activeLeftTab: "chat" | "terminal" | "steps";
  activeRightTab: "preview" | "editor" | "inspector";
  setActiveLeftTab: (tab: "chat" | "terminal" | "steps") => void;
  setActiveRightTab: (tab: "preview" | "editor" | "inspector") => void;

  // Session state
  sessionId: string | null;
  setSessionId: (id: string | null) => void;

  // Project files
  files: Map<string, string>;
  setFile: (path: string, content: string) => void;
  getFile: (path: string) => string | undefined;
  deleteFile: (path: string) => void;

  // Terminal state
  terminalOutput: string;
  appendTerminalOutput: (output: string) => void;
  clearTerminalOutput: () => void;

  // Chat messages
  messages: Array<{ id: string; role: "user" | "assistant" | "system"; content: string; timestamp: Date }>;
  addMessage: (message: { role: "user" | "assistant" | "system"; content: string }) => void;
  clearMessages: () => void;

  // Preview URL
  previewUrl: string;
  setPreviewUrl: (url: string) => void;

  // Connection status
  connected: boolean;
  setConnected: (connected: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Active tabs
  activeLeftTab: "chat",
  activeRightTab: "preview",
  setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),

  // Session state
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),

  // Project files
  files: new Map(),
  setFile: (path, content) => set((state) => {
    const newFiles = new Map(state.files);
    newFiles.set(path, content);
    return { files: newFiles };
  }),
  getFile: (path) => get().files.get(path),
  deleteFile: (path) => set((state) => {
    const newFiles = new Map(state.files);
    newFiles.delete(path);
    return { files: newFiles };
  }),

  // Terminal state
  terminalOutput: "",
  appendTerminalOutput: (output) => set((state) => ({
    terminalOutput: state.terminalOutput + output
  })),
  clearTerminalOutput: () => set({ terminalOutput: "" }),

  // Chat messages
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, { ...message, id: crypto.randomUUID(), timestamp: new Date() }]
  })),
  clearMessages: () => set({ messages: [] }),

  // Preview URL
  previewUrl: "",
  setPreviewUrl: (url) => set({ previewUrl: url }),

  // Connection status
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
