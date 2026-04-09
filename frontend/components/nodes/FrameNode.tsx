"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Code2, Settings } from "lucide-react";
import { useVibecoStore, type FrameId, type FrameStatus } from "@/lib/store";

// ── Types ────────────────────────────────────────────────────────────────────

export interface FrameNodeData extends Record<string, unknown> {
  frameId: FrameId;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
}

export type FrameNodeType = Node<FrameNodeData, "frame">;

// ── Static code snippets (read-only) ─────────────────────────────────────────

const CODE_SNIPPETS: Record<FrameId, string> = {
  frontend: `// Next.js Page (唯讀 · 由 vibeco 生成)
"use client"

export default function Page() {
  return (
    <main className="p-8">
      <h1>vibeco app</h1>
    </main>
  )
}`,
  api: `# FastAPI Route (唯讀 · 由 vibeco 生成)
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class ActionRequest(BaseModel):
    payload: dict

@router.post("/api/action")
async def action(body: ActionRequest):
    return {"status": "ok"}`,
  backend: `# Business Logic (唯讀 · 由 vibeco 生成)
from pydantic import BaseModel

class ProcessResult(BaseModel):
    result: dict

def process(data: dict) -> ProcessResult:
    # AI Agent 邏輯在此運算
    return ProcessResult(result=data)`,
};

// ── Status helpers ────────────────────────────────────────────────────────────

const borderClass: Record<FrameStatus, string> = {
  idle: "border-slate-700",
  ok: "border-emerald-500",
  error: "border-rose-500",
  warning: "border-amber-500",
};

const dotClass: Record<FrameStatus, string> = {
  idle: "bg-slate-600",
  ok: "bg-emerald-500",
  error: "animate-pulse bg-rose-500",
  warning: "animate-pulse bg-amber-500",
};

// ── Component ─────────────────────────────────────────────────────────────────

export const FrameNode = memo(function FrameNode({
  data,
  selected,
}: NodeProps<FrameNodeType>) {
  const { frameId, title, subtitle, icon, description } = data;
  const [showCode, setShowCode] = useState(false);
  const frames = useVibecoStore((s) => s.frames);
  const frame = frames[frameId];

  const border = selected
    ? "border-blue-400 shadow-blue-400/20"
    : borderClass[frame.status];

  return (
    <div
      className={`relative w-64 rounded-2xl border-2 bg-slate-900 shadow-xl transition-all duration-200 ${border}`}
    >
      {/* React Flow handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!border-slate-600 !bg-slate-700"
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-3 border-b border-slate-800 p-4">
        <span className="text-2xl">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
        {/* Status dot */}
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass[frame.status]}`}
        />
      </div>

      {/* ── Body: flip between white-label and code ── */}
      <div className="p-4">
        {!showCode ? (
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-slate-400">{description}</p>
            <div className="rounded-lg bg-slate-800/60 p-3">
              <p className="text-xs font-medium text-slate-300">
                點擊卡片 → 開啟右側設定面板
              </p>
            </div>
          </div>
        ) : (
          <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-[10px] leading-relaxed text-emerald-400 select-none">
            {CODE_SNIPPETS[frameId]}
          </pre>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-slate-800 px-4 py-2">
        {/* Toggle code/white-label — stops event from bubbling to node click */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowCode((v) => !v);
          }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
        >
          <Code2 className="h-3 w-3" />
          {showCode ? "白話文模式" : "查看程式碼"}
        </button>

        <Settings className="h-3.5 w-3.5 text-slate-600" />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!border-slate-600 !bg-slate-700"
      />
    </div>
  );
});
