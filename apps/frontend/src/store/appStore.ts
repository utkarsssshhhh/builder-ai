import { create } from 'zustand';
import type { ChatMessage, GeneratedFile } from '@builder/common';
import { generateId } from '@builder/common';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ActiveView = 'code' | 'preview' | 'split';

interface AppState {
  // Chat
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;

  // Files
  files: GeneratedFile[];
  activeFilePath: string | null;
  openTabs: string[];

  // View
  activeView: ActiveView;

  // Actions — Chat
  addUserMessage: (content: string) => string;
  addAssistantMessage: (content: string, files?: GeneratedFile[]) => void;
  setStreaming: (isStreaming: boolean) => void;
  appendStreamingContent: (chunk: string) => void;
  clearStreamingContent: () => void;

  // Actions — Files
  setFiles: (files: GeneratedFile[]) => void;
  updateFile: (path: string, content: string) => void;
  setActiveFile: (path: string) => void;
  openTab: (path: string) => void;
  closeTab: (path: string) => void;

  // Actions — View
  setActiveView: (view: ActiveView) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // ─── Initial State ──────────────────────────────────────────────────────
  messages: [],
  isStreaming: false,
  streamingContent: '',
  files: [],
  activeFilePath: null,
  openTabs: [],
  activeView: 'code',

  // ─── Chat Actions ───────────────────────────────────────────────────────
  addUserMessage: (content: string) => {
    const id = generateId();
    set((state) => ({
      messages: [
        ...state.messages,
        { id, role: 'user', content, timestamp: Date.now() },
      ],
    }));
    return id;
  },

  addAssistantMessage: (content: string, files?: GeneratedFile[]) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          role: 'assistant',
          content,
          timestamp: Date.now(),
          files,
        },
      ],
    }));
  },

  setStreaming: (isStreaming: boolean) => set({ isStreaming }),

  appendStreamingContent: (chunk: string) =>
    set((state) => ({ streamingContent: state.streamingContent + chunk })),

  clearStreamingContent: () => set({ streamingContent: '' }),

  // ─── File Actions ───────────────────────────────────────────────────────
  setFiles: (files: GeneratedFile[]) => {
    const currentTabs = get().openTabs;
    const newTabs = files
      .map((f) => f.path)
      .filter((p) => !currentTabs.includes(p));
    const allTabs = [...currentTabs, ...newTabs];

    set({
      files,
      openTabs: allTabs,
      activeFilePath: get().activeFilePath ?? files[0]?.path ?? null,
    });
  },

  updateFile: (path: string, content: string) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.path === path ? { ...f, content } : f
      ),
    })),

  setActiveFile: (path: string) => {
    const state = get();
    if (!state.openTabs.includes(path)) {
      set({ openTabs: [...state.openTabs, path], activeFilePath: path });
    } else {
      set({ activeFilePath: path });
    }
  },

  openTab: (path: string) => {
    const state = get();
    if (!state.openTabs.includes(path)) {
      set({ openTabs: [...state.openTabs, path], activeFilePath: path });
    } else {
      set({ activeFilePath: path });
    }
  },

  closeTab: (path: string) => {
    set((state) => {
      const newTabs = state.openTabs.filter((t) => t !== path);
      let newActive = state.activeFilePath;
      if (state.activeFilePath === path) {
        const idx = state.openTabs.indexOf(path);
        newActive = newTabs[Math.min(idx, newTabs.length - 1)] ?? null;
      }
      return { openTabs: newTabs, activeFilePath: newActive };
    });
  },

  // ─── View Actions ───────────────────────────────────────────────────────
  setActiveView: (view: ActiveView) => set({ activeView: view }),
}));
