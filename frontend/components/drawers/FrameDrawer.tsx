"use client";

import { AlertTriangle, X } from "lucide-react";
import { useVibecoStore, type FrameId, type FrameConfig } from "@/lib/store";

// ── Field definitions per frame ───────────────────────────────────────────────

type FieldDef =
  | { label: string; key: keyof FrameConfig; type: "select"; options: string[] }
  | { label: string; key: keyof FrameConfig; type: "toggle" }
  | { label: string; key: keyof FrameConfig; type: "text" };

const FRAME_META: Record<
  FrameId,
  { title: string; icon: string; fields: FieldDef[] }
> = {
  frontend: {
    title: "店面裝潢設定",
    icon: "🏪",
    fields: [
      {
        label: "頁面樣式",
        key: "componentType",
        type: "select",
        options: ["landing", "dashboard", "form"],
      },
      {
        label: "色彩主題",
        key: "colorTheme",
        type: "select",
        options: ["dark", "light", "brand"],
      },
      { label: "需要登入才能進入", key: "requireAuth", type: "toggle" },
    ],
  },
  api: {
    title: "傳令通道設定",
    icon: "🔗",
    fields: [
      {
        label: "請求方式",
        key: "method",
        type: "select",
        options: ["GET", "POST", "PUT", "DELETE"],
      },
      { label: "端點路徑", key: "endpoint", type: "text" },
    ],
  },
  backend: {
    title: "後台大腦設定",
    icon: "⚙️",
    fields: [
      {
        label: "程式語言",
        key: "language",
        type: "select",
        options: ["python", "typescript"],
      },
      { label: "啟用資料庫", key: "dbEnabled", type: "toggle" },
    ],
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface FrameDrawerProps {
  open: boolean;
  frameId: FrameId | null;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function FrameDrawer({ open, frameId, onClose }: FrameDrawerProps) {
  const frames = useVibecoStore((s) => s.frames);
  const conflicts = useVibecoStore((s) => s.conflicts);
  const updateConfig = useVibecoStore((s) => s.updateConfig);

  if (!frameId) return null;

  const meta = FRAME_META[frameId];
  const frame = frames[frameId];
  const frameConflicts = conflicts.filter(
    (c) => c.from === frameId || c.to === frameId
  );

  function getValue(key: keyof FrameConfig): string | boolean {
    return frame.config[key] ?? "";
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-30 flex w-80 flex-col border-l border-slate-700 bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 p-5">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <p className="font-semibold text-white">{meta.title}</p>
            <p className="text-xs text-slate-400">白話文設定模式</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conflict warnings */}
        {frameConflicts.length > 0 && (
          <div className="mx-4 mt-4 space-y-2">
            {frameConflicts.map((c, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border border-rose-800 bg-rose-950/60 p-3 text-xs text-rose-300"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{c.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Fields */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {meta.fields.map((field) => {
            const val = getValue(field.key);

            return (
              <div key={field.key}>
                <label className="mb-2 block text-xs font-medium text-slate-300">
                  {field.label}
                </label>

                {field.type === "select" && (
                  <select
                    value={String(val)}
                    onChange={(e) =>
                      updateConfig(frameId, { [field.key]: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === "text" && (
                  <input
                    type="text"
                    value={String(val)}
                    onChange={(e) =>
                      updateConfig(frameId, { [field.key]: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                )}

                {field.type === "toggle" && (
                  <button
                    onClick={() =>
                      updateConfig(frameId, { [field.key]: !val })
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      val ? "bg-blue-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        val ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <p className="text-center text-xs text-slate-500">
            程式碼由 vibeco 自動生成，禁止手動修改
          </p>
        </div>
      </div>
    </>
  );
}
