"use client";

import { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
  type Connection,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Rocket, Zap } from "lucide-react";
import { FrameNode, type FrameNodeData } from "@/components/nodes/FrameNode";
import { FrameDrawer } from "@/components/drawers/FrameDrawer";
import { useVibecoStore, type FrameId } from "@/lib/store";

// ── Node types ────────────────────────────────────────────────────────────────

const nodeTypes = { frame: FrameNode };

// ── Initial graph ─────────────────────────────────────────────────────────────

const INITIAL_NODES: Node<FrameNodeData>[] = [
  {
    id: "frontend",
    type: "frame",
    position: { x: 60, y: 180 },
    data: {
      frameId: "frontend",
      title: "店面裝潢",
      subtitle: "Frontend · Next.js",
      icon: "🏪",
      description: "使用者看到的畫面、按鈕與互動元素。",
    },
  },
  {
    id: "api",
    type: "frame",
    position: { x: 460, y: 180 },
    data: {
      frameId: "api",
      title: "傳令通道",
      subtitle: "API · FastAPI",
      icon: "🔗",
      description: "前後端之間傳遞訊息的橋樑，負責格式驗證。",
    },
  },
  {
    id: "backend",
    type: "frame",
    position: { x: 860, y: 180 },
    data: {
      frameId: "backend",
      title: "後台大腦",
      subtitle: "Backend · Python",
      icon: "⚙️",
      description: "處理商業邏輯、AI 推論與資料運算。",
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: "fe-api",
    source: "frontend",
    target: "api",
    animated: true,
    style: { stroke: "#475569", strokeWidth: 2 },
  },
  {
    id: "api-be",
    source: "api",
    target: "backend",
    animated: true,
    style: { stroke: "#475569", strokeWidth: 2 },
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CanvasPage() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [launching, setLaunching] = useState(false);

  const { selectedFrame, setSelectedFrame, conflicts } = useVibecoStore();

  // Merge conflict styling into edges
  const styledEdges = edges.map((edge) => {
    const hasConflict = conflicts.some(
      (c) =>
        (c.from === edge.source && c.to === edge.target) ||
        (c.from === edge.target && c.to === edge.source)
    );
    return hasConflict
      ? {
          ...edge,
          animated: true,
          style: { stroke: "#f43f5e", strokeWidth: 3 },
        }
      : edge;
  });

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedFrame(node.id as FrameId);
      setDrawerOpen(true);
    },
    [setSelectedFrame]
  );

  const handleLaunch = () => {
    setLaunching(true);
    // Simulate launch sequence — real API call goes here
    setTimeout(() => setLaunching(false), 3000);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950">
      {/* ── Top bar ── */}
      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-blue-400" />
          <span className="text-base font-bold tracking-tight text-white">
            vibeco
          </span>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
            No-Code AI Control Plane
          </span>
        </div>

        <button
          onClick={handleLaunch}
          disabled={launching}
          className="flex items-center gap-2 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-400 active:scale-95 disabled:cursor-wait disabled:opacity-70"
        >
          <Rocket className="h-4 w-4" />
          {launching ? "準備開幕中…" : "正式開幕"}
        </button>
      </header>

      {/* ── Launch progress banner ── */}
      {launching && (
        <div className="absolute inset-x-0 top-[52px] z-10 flex items-center gap-3 bg-rose-950/80 px-6 py-2 text-sm text-rose-200 backdrop-blur">
          <span className="animate-spin">⚙️</span>
          <span>正在配置伺服器環境，請稍候…</span>
        </div>
      )}

      {/* ── Conflict banner ── */}
      {!launching && conflicts.length > 0 && (
        <div className="absolute inset-x-0 top-[52px] z-10 flex items-center gap-2 bg-rose-900/80 px-6 py-2 text-sm text-rose-200 backdrop-blur">
          <span>🚨</span>
          <span>{conflicts[0].message}</span>
          <span className="ml-1 text-rose-400">
            — 請修正右側匡的設定後再繼續
          </span>
        </div>
      )}

      {/* ── React Flow canvas ── */}
      <div className="absolute inset-0 pt-[52px]">
        <ReactFlow
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.4}
          maxZoom={1.5}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1e293b"
          />
          <Controls
            showInteractive={false}
            className="!border-slate-700 !bg-slate-800 !shadow-lg [&>button]:!border-slate-700 [&>button]:!bg-slate-800 [&>button]:!text-slate-300"
          />
        </ReactFlow>
      </div>

      {/* ── Settings drawer ── */}
      <div className="absolute inset-0 pt-[52px] pointer-events-none">
        <div className="relative h-full pointer-events-auto">
          <FrameDrawer
            open={drawerOpen}
            frameId={selectedFrame}
            onClose={() => setDrawerOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
