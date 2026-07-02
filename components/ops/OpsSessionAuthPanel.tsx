"use client";

import { useState } from "react";

import type { OpsSessionAuthAction } from "@/lib/ops/session";

type OpsSessionAuthPanelProps = {
  sessionId: string;
  planSummary?: string | null;
  onAuthComplete: () => void | Promise<void>;
  onAuth: (action: OpsSessionAuthAction) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function OpsSessionAuthPanel({
  sessionId,
  planSummary,
  onAuthComplete,
  onAuth,
}: OpsSessionAuthPanelProps) {
  const [loadingAction, setLoadingAction] = useState<OpsSessionAuthAction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: OpsSessionAuthAction) => {
    setLoadingAction(action);
    setError(null);
    const result = await onAuth(action);
    setLoadingAction(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    await onAuthComplete();
  };

  return (
    <section
      className="rounded-2xl border border-amber-200/90 bg-amber-50/60 px-4 py-4"
      aria-labelledby="ops-session-auth-heading"
    >
      <div id="ops-session-auth-heading" className="font-serif text-base text-amber-950">
        计划待授权
      </div>
      <p className="mt-1 text-xs text-amber-900/80">
        Session <span className="font-mono">{sessionId}</span> · 请确认 00 计划后开始派工
      </p>

      {planSummary ? (
        <div className="mt-3 max-h-48 overflow-y-auto rounded-lg border border-amber-100 bg-white/70 px-3 py-2 text-sm text-slate-800 whitespace-pre-wrap">
          {planSummary}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">计划摘要将随最近一轮对话生成。</p>
      )}

      {error ? (
        <p className="mt-3 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => void handleAction("approve")}
          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {loadingAction === "approve" ? "授权中…" : "授权并开始"}
        </button>
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => void handleAction("revise")}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {loadingAction === "revise" ? "提交中…" : "修改计划"}
        </button>
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => void handleAction("cancel")}
          className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-sm text-rose-800 hover:bg-rose-50 disabled:opacity-50"
        >
          {loadingAction === "cancel" ? "提交中…" : "取消"}
        </button>
      </div>
    </section>
  );
}
