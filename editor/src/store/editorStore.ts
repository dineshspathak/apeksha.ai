import { create } from "zustand";

export interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tools?: { type: string; content: string }[];
  timestamp: number;
}

interface EditorState {
  // File tree
  files: FileNode[];
  openFiles: string[];
  activeFile: string | null;
  fileContents: Record<string, string>;

  // Panels
  showSidebar: boolean;
  showChat: boolean;
  showTerminal: boolean;
  sidebarTab: "files" | "search";

  // Chat
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  // Actions
  setFiles: (files: FileNode[]) => void;
  openFile: (path: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
  toggleSidebar: () => void;
  toggleChat: () => void;
  toggleTerminal: () => void;
  addChatMessage: (message: ChatMessage) => void;
  setChatLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  // Initial state
  files: [],
  openFiles: [],
  activeFile: null,
  fileContents: {},
  showSidebar: true,
  showChat: true,
  showTerminal: true,
  sidebarTab: "files",
  chatMessages: [],
  chatLoading: false,

  // Actions
  setFiles: (files) => set({ files }),

  openFile: (path) =>
    set((state) => ({
      openFiles: state.openFiles.includes(path)
        ? state.openFiles
        : [...state.openFiles, path],
      activeFile: path,
    })),

  closeFile: (path) =>
    set((state) => {
      const newOpen = state.openFiles.filter((f) => f !== path);
      const newActive =
        state.activeFile === path
          ? newOpen[newOpen.length - 1] || null
          : state.activeFile;
      return { openFiles: newOpen, activeFile: newActive };
    }),

  setActiveFile: (path) => set({ activeFile: path }),

  updateFileContent: (path, content) =>
    set((state) => ({
      fileContents: { ...state.fileContents, [path]: content },
    })),

  toggleSidebar: () => set((state) => ({ showSidebar: !state.showSidebar })),
  toggleChat: () => set((state) => ({ showChat: !state.showChat })),
  toggleTerminal: () => set((state) => ({ showTerminal: !state.showTerminal })),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),

  setChatLoading: (loading) => set({ chatLoading: loading }),

  clearChat: () => set({ chatMessages: [] }),
}));
