"use client";

import { useCallback, useEffect, useState } from "react";

import {
  fetchOpsSessionPromotePreview,
  postOpsSessionPromote,
  type OpsSessionPromotePreview,
  type OpsSessionPromoteResult,
  type OpsSessionTargetRepo,
} from "@/lib/ops/session";

const TARGET_REPOS: { id: OpsSessionTargetRepo; label: string }[] = [
  { id: "ai-ink-brain-api-python", label: "api-python" },
  { id: "ai-ink-brain", label: "Ink 前端" },
];

type OpsSessionPromotePanelProps = {
  sessionId: string;
  status: string;
  onPromoteComplete?: () => void;
};

export function OpsSessionPromotePanel({
  sessionId,
  status,
  onPromoteComplete,
}: OpsSessionPromotePanelProps) {
  const [targetRepo, setTargetRepo] = useState<OpsSessionTargetRepo>("ai-ink-brain-api-python");
  const [targetBranch, setTargetBranch] = useState("main");
  const [preview, setPreview] = useState<OpsSessionPromotePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OpsSessionPromoteResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    setError(null);
    const data = await fetchOpsSessionPromotePreview(sessionId, targetRepo, targetBranch);
    setLoadingPreview(false);
    if (!data) {
      setError("无法加载 promote 预览");
      setPreview(null);
      return;
    }
    setPreview(data);
  }, [sessionId, targetBranch, targetRepo]);

  useEffect(() => {
    if (status !== "dispatched") return;
    let cancelled = false;
    void fetchOpsSessionPromotePreview(sessionId, targetRepo, targetBranch).then((data) => {
      if (cancelled) return;
      if (!data) {
        setError("无法加载 promote 预览");
        setPreview(null);
        return;
      }
      setPreview(data);
    });
    return () => {
      cancelled = true;
    };
  }, [sessionId, targetBranch, targetRepo, status]);

  const handlePromote = useCallback(async () => {
    setPromoting(true);
    setError(null);
    setResult(null);
    const res = await postOpsSessionPromote(sessionId, {
      target_repo: targetRepo,
      target_branch: targetBranch,
      confirm: true,
    });
    setPromoting(false);
    setConfirmOpen(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.data);
    onPromoteComplete?.();
  }, [onPromoteComplete, sessionId, targetBranch, targetRepo]);

  if (status !== "dispatched") return null;

  return (
    <section className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 px-4 py-4">
      <div className="font-serif text-sm text-indigo-950">Promote 向导（S4）</div>
      <p className="mt-1 text-[11px] text-indigo-900/80">
        将 session task 草稿复制到业务仓 · promote 前 harness-probe verify 阻塞 · 不 auto-commit
      </p>
      <p className="mt-1 text-[10px] text-slate-500">
        全量 verify 建议本地或 GHA；Vercel 部署环境可能无法同步跑 probe。
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-[11px] text-slate-600">
          目标仓
          <select
            value={targetRepo}
            onChange={(e) => setTargetRepo(e.target.value as OpsSessionTargetRepo)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
          >
            {TARGET_REPOS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11px] text-slate-600">
          目标分支
          <input
            value={targetBranch}
            onChange={(e) => setTargetBranch(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-mono"
          />
        </label>
        <button
          type="button"
          onClick={() => void loadPreview()}
          disabled={loadingPreview}
          className="self-end rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700"
        >
          {loadingPreview ? "…" : "刷新预览"}
        </button>
      </div>

      {preview ? (
        <div className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-[11px] text-slate-700">
          <div className="font-mono">源：{preview.source_task_path}</div>
          <div className="mt-1 font-mono break-all">目标：{preview.target_task_path}</div>
          {preview.conflict ? (
            <div className="mt-1 text-rose-700">目标文件已存在 · promote 将冲突</div>
          ) : null}
          {!preview.probe_available ? (
            <div className="mt-1 text-amber-800">probe CLI 不可用 · promote 将 503</div>
          ) : null}
          <div className="mt-1 text-slate-500">
            待签收闸：{preview.gate_summary.pending.join(" · ") || "无"}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-950">
          <div>{result.message ?? "Promote 完成"}</div>
          <div className="mt-1 font-mono text-[10px] break-all">{result.target_task_path}</div>
          {result.verify_report ? (
            <pre className="mt-2 max-h-32 overflow-auto rounded border border-emerald-200/60 bg-white/80 p-2 font-mono text-[10px]">
              {JSON.stringify(result.verify_report, null, 2)}
            </pre>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3">
        {!confirmOpen ? (
          <button
            type="button"
            disabled={promoting || preview?.conflict}
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl bg-indigo-900 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            确认 promote
          </button>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
            <p>将复制 task 到业务仓并运行 verify。不会自动 git commit。</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => void handlePromote()}
                disabled={promoting}
                className="rounded-lg bg-indigo-900 px-3 py-1.5 text-xs text-white"
              >
                {promoting ? "执行中…" : "二次确认 · 执行"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
