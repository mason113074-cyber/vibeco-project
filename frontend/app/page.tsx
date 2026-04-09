"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, Zap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const API_BASE =
  typeof process.env.NEXT_PUBLIC_API_URL === "string"
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8000";

/** 表單送出走勢：此頁無輸入欄位，仍用 RHF + Zod 包一層空物件以符合家規。 */
const emptyFormSchema = z.object({});
type EmptyFormValues = z.infer<typeof emptyFormSchema>;

/** 後端 /api/health 回傳 JSON 的契約（前端用 Zod 嚴格驗證）。 */
const healthResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
});

type HealthResult =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; userMessage: string };

export default function Home() {
  const [health, setHealth] = useState<HealthResult>({ kind: "idle" });

  const form = useForm<EmptyFormValues>({
    resolver: zodResolver(emptyFormSchema),
    defaultValues: {},
  });

  const onSubmit = form.handleSubmit(async () => {
    setHealth({ kind: "idle" });
    try {
      const res = await fetch(`${API_BASE}/api/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        setHealth({
          kind: "error",
          userMessage: "後端有回應，但狀態不正常，請稍後再試或確認後端版本。",
        });
        return;
      }

      let json: unknown;
      try {
        json = await res.json();
      } catch {
        setHealth({
          kind: "error",
          userMessage:
            "後端回傳的不是有效的 JSON，請檢查 API 是否為 FastAPI 預設格式。",
        });
        return;
      }

      const parsed = healthResponseSchema.safeParse(json);
      if (!parsed.success) {
        setHealth({
          kind: "error",
          userMessage:
            "後端回傳的欄位與預期不一致，請確認 /api/health 仍回傳 status 與 message。",
        });
        return;
      }

      setHealth({ kind: "success", message: parsed.data.message });
    } catch {
      setHealth({
        kind: "error",
        userMessage:
          "無法連上後端，請確認後端已在 http://localhost:8000 啟動（本機開發時）。",
      });
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Activity className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">
              vibeco
            </h1>
            <p className="text-sm text-slate-500">前端 ↔ 後端 連線測試</p>
          </div>
        </div>

        {/* Canvas entry */}
        <Link
          href="/canvas"
          className="mb-6 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
        >
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            進入 vibeco 畫布
          </span>
          <span>→</span>
        </Link>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {form.formState.isSubmitting ? "測試中…" : "測試後端連線"}
            </button>

            {health.kind === "success" && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <span aria-hidden>🟢</span>
                <span>後端活著！</span>
                <span className="font-normal text-slate-600">
                  （{health.message}）
                </span>
              </p>
            )}

            {health.kind === "error" && (
              <p className="flex max-w-full flex-wrap items-center gap-2 text-sm font-medium text-rose-700">
                <span aria-hidden>🔴</span>
                <span>{health.userMessage}</span>
              </p>
            )}
          </div>
        </form>
      </div>
    </main>
  );
}
