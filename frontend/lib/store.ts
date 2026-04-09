import { create } from "zustand";

export type FrameId = "frontend" | "api" | "backend";
export type FrameStatus = "idle" | "ok" | "error" | "warning";

export interface FrameConfig {
  // frontend
  componentType?: string;
  colorTheme?: string;
  requireAuth?: boolean;
  // api
  method?: string;
  endpoint?: string;
  // backend
  language?: string;
  dbEnabled?: boolean;
}

export interface ConflictLine {
  from: FrameId;
  to: FrameId;
  message: string;
}

interface FrameState {
  status: FrameStatus;
  config: FrameConfig;
}

interface VibecoStore {
  selectedFrame: FrameId | null;
  frames: Record<FrameId, FrameState>;
  conflicts: ConflictLine[];
  setSelectedFrame: (id: FrameId | null) => void;
  setFrameStatus: (id: FrameId, status: FrameStatus) => void;
  updateConfig: (id: FrameId, patch: Partial<FrameConfig>) => void;
  setConflicts: (conflicts: ConflictLine[]) => void;
  clearConflicts: () => void;
}

const defaultFrames: Record<FrameId, FrameState> = {
  frontend: {
    status: "idle",
    config: { componentType: "landing", colorTheme: "dark", requireAuth: false },
  },
  api: {
    status: "idle",
    config: { method: "POST", endpoint: "/api/action" },
  },
  backend: {
    status: "idle",
    config: { language: "python", dbEnabled: false },
  },
};

export const useVibecoStore = create<VibecoStore>((set) => ({
  selectedFrame: null,
  frames: defaultFrames,
  conflicts: [],

  setSelectedFrame: (id) => set({ selectedFrame: id }),

  setFrameStatus: (id, status) =>
    set((s) => ({
      frames: { ...s.frames, [id]: { ...s.frames[id], status } },
    })),

  updateConfig: (id, patch) =>
    set((s) => ({
      frames: {
        ...s.frames,
        [id]: { ...s.frames[id], config: { ...s.frames[id].config, ...patch } },
      },
    })),

  setConflicts: (conflicts) => set({ conflicts }),
  clearConflicts: () => set({ conflicts: [] }),
}));
