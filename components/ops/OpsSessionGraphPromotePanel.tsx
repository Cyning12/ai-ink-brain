"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchOpsSessionGraphPromotePreview,
  postOpsSessionGraphPromote,
  type ConflictAction,
  type OpsSessionGraphPromotePreview,
  type OpsSessionGraphPromoteResult,
  type OpsSessionTargetRepo,
} from "@/lib/ops/session";

const TARGET_REPOS: { id: OpsSessionTargetRepo; label: string }[] = [
  { id: "ai-ink-brain-api-python", label: "api-python" },
  { id: "ai-ink-brain", label: "Ink 前端" },
];

const CONFLICT_ACTIONS: { id: ConflictAction; label: string; hint: string }[] = [
  { id: "block", label: "block", hint: "保留目标文件（默认）" },
  { id: "overwrite", label: "overwrite", hint: "覆盖目标文件" },
  { id: "merge", label: "merge", hint: "生成并预览合并版" },
];

const HG_PROMOTE_GRAPH = "HG-PROMOTE-GRAPH";
const BRANCH_DEBOUNCE_MS = 400;

type OpsSessionGraphPromotePanelProps = {
  sessionId: string;
  status: string;
  onPromoteComplete?: () => void;
};

export function OpsSessionGraphPromotePanel({
  sessionId,
  status,
  onPromoteComplete,
}: OpsSessionGraphPromotePanelProps) {
  const [targetRepo, setTargetRepo] = useState<OpsSessionTargetRepo>("ai-ink-brain-api-python");
  const [targetBranch, setTargetBranch] = useState("main");
  const [preview, setPreview] = useState<OpsSessionGraphPromotePreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OpsSessionGraphPromoteResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [conflictAction, setConflictAction] = useState<ConflictAction>("block");
  const prevRepoRef = useRef(targetRepo);

  const resetPromoteFeedback = useCallback(() => {
    setError(null);
    setResult(null);
    setConfirmOpen(false);
  }, []);

  const resetConflictState = useCallback(() => {
    setConflictAction("block");
    setConfirmOpen(false);
  }, []);

  const loadPreview = useCallback(async () => {
    setLoadingPreview(true);
    const data = await fetchOpsSessionGraphPromotePreview(sessionId, targetRepo, targetBranch);
    setLoadingPreview(false);
    if (!data) {
      setError("无法加载图谱 promote 预览");
      setPreview(null);
      return;
    }
    setPreview(data);
    setConflictAction(data.conflict_action ?? "block");
  }, [sessionId, targetBranch, targetRepo]);

  useEffect(() => {
    if (status !== "dispatched") return;
    const repoChanged = prevRepoRef.current !== targetRepo;
    prevRepoRef.current = targetRepo;
    const delay = repoChanged ? 0 : BRANCH_DEBOUNCE_MS;
    const timer = setTimeout(() => {
      void loadPreview();
    }, delay);
    return () => clearTimeout(timer);
  }, [sessionId, status, targetBranch, targetRepo, loadPreview]);

  const handleTargetRepoChange = useCallback(
    (value: OpsSessionTargetRepo) => {
      resetPromoteFeedback();
      resetConflictState();
      setTargetRepo(value);
    },
    [resetPromoteFeedback, resetConflictState],
  );

  const handleTargetBranchChange = useCallback(
    (value: string) => {
      resetPromoteFeedback();
      resetConflictState();
      setTargetBranch(value);
    },
    [resetPromoteFeedback, resetConflictState],
  );

  const handleConflictActionChange = useCallback((value: ConflictAction) => {
    setConflictAction(value);
    setError(null);
    setConfirmOpen(false);
  }, []);

  const handlePromote = useCallback(async () => {
    setPromoting(true);
    setError(null);
    const res = await postOpsSessionGraphPromote(sessionId, {
      target_repo: targetRepo,
      target_branch: targetBranch,
      confirm: true,
      conflict_action: conflictAction,
    });
    setPromoting(false);
    setConfirmOpen(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setResult(res.data);
    void loadPreview();
    onPromoteComplete?.();
  }, [conflictAction, loadPreview, onPromoteComplete, sessionId, targetBranch, targetRepo]);

  if (status !== "dispatched") return null;

  const promotedThisSelection =
    result !== null &&
    result.target_repo === targetRepo &&
    result.target_branch === targetBranch &&
    result.conflict_action === conflictAction;
  const isConflict = preview?.conflict === true;
  const blockStrategy = isConflict && conflictAction === "block";
  const promoteClosed = promotedThisSelection || blockStrategy;
  const graphGatePending = preview?.gate_summary.pending.includes(HG_PROMOTE_GRAPH) ?? false;
  const empty = preview?.empty === true;

  return (
    <section className="rounded-2xl border border-indigo-200/80 bg-indigo-50/40 px-4 py-4">
      <div className="font-serif text-sm text-indigo-950">图谱 Promote（S5.2）</div>
      <p className="mt-1 text-[11px] text-indigo-900/80">
        将 session graph_delta 复制到业务仓 docs/_tech_graph/ · 不 auto-commit
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-[11px] text-slate-600">
          目标仓
          <select
            value={targetRepo}
            onChange={(e) => handleTargetRepoChange(e.target.value as OpsSessionTargetRepo)}
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
            onChange={(e) => handleTargetBranchChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-mono"
          />
        </label>
        {loadingPreview ? (
          <span className="self-end text-[11px] text-slate-500">预览刷新中…</span>
        ) : null}
      </div>

      {preview ? (
        <div className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2 text-[11px] text-slate-700">
          <div className="font-mono break-all">源：{preview.source_dir}</div>
          <div className="mt-1 font-mono break-all">目标：{preview.target_dir}</div>
          {empty ? (
            <div className="mt-1 text-slate-500">当前 session 无 graph_delta 文件</div>
          ) : (
            <>
              {isConflict ? (
                <div className="mt-1 text-amber-800">目标路径已存在冲突文件 · 请选择冲突策略</div>
              ) : (
                <div className="mt-1 text-emerald-800">目标路径空闲 · 可直接 promote</div>
              )}
              <div className="mt-1 text-slate-500">
                待签收闸：{preview.gate_summary.pending.join(" · ") || "无"}
              </div>
              <div className="mt-1 text-slate-500">
                须人签 <span className="font-mono">{HG_PROMOTE_GRAPH}</span> 后才可确认 promote
              </div>
            </>
          )}
        </div>
      ) : null}

      {preview && !empty ? (
        <div className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2">
          <div className="text-[11px] font-medium text-slate-700">graph_delta 文件清单</div>
          <ul className="mt-2 space-y-1.5">
            {preview.files.map((file) => (
              <li key={file.name} className="text-[11px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-medium">{file.name}</span>
                  {file.exists ? (
                    <span className="rounded bg-amber-100 px-1 py-0.5 text-[10px] text-amber-900">
                      目标已存在
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-100 px-1 py-0.5 text-[10px] text-emerald-900">
                      新增
                    </span>
                  )}
                </div>
                <div className="mt-0.5 font-mono text-[10px] text-slate-500 break-all">
                  {file.target_path}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {preview && !empty && isConflict ? (
        <div className="mt-3 rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2">
          <div className="text-[11px] font-medium text-amber-950">冲突策略</div>
          <div className="mt-2 flex flex-wrap gap-4">
            {CONFLICT_ACTIONS.map((action) => (
              <label key={action.id} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                <input
                  type="radio"
                  name="graph_conflict_action"
                  value={action.id}
                  checked={conflictAction === action.id}
                  onChange={(e) => handleConflictActionChange(e.target.value as ConflictAction)}
                  className="accent-indigo-700"
                />
                <span className="font-medium">{action.label}</span>
                <span className="text-slate-500">{action.hint}</span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {preview && !empty && preview.diff_summary.length > 0 ? (
        <div className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 px-3 py-2">
          <div className="text-[11px] font-medium text-slate-700">Diff 摘要</div>
          <div className="mt-2 space-y-2">
            {preview.diff_summary.map((diff) => (
              <div key={diff.path}>
                <div className="font-mono text-[10px] text-slate-600 break-all">{diff.path}</div>
                <div className="mt-0.5 text-[10px] text-slate-500">
                  源 {diff.source_lines} 行 · 目标 {diff.target_lines} 行
                </div>
                {diff.added && diff.added.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {diff.added.map((line, idx) => (
                      <li key={`added-${idx}`} className="font-mono text-[10px] text-emerald-800">
                        + {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {diff.removed && diff.removed.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {diff.removed.map((line, idx) => (
                      <li key={`removed-${idx}`} className="font-mono text-[10px] text-rose-800">
                        - {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {diff.changed && diff.changed.length > 0 ? (
                  <ul className="mt-1 space-y-0.5">
                    {diff.changed.map((line, idx) => (
                      <li key={`changed-${idx}`} className="font-mono text-[10px] text-amber-800">
                        ~ {line}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
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
          <div>{result.message ?? "图谱 promote 完成"}</div>
          {result.copied_files.length > 0 ? (
            <ul className="mt-2 space-y-0.5">
              {result.copied_files.map((path) => (
                <li key={path} className="font-mono text-[10px] break-all">
                  {path}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3">
        {empty ? (
          <div className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-3 py-2 text-sm text-slate-600">
            当前 session 暂无可 promote 的 graph_delta。
          </div>
        ) : promoteClosed ? (
          <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-950">
            <div className="font-medium">✓ 当前策略已处理</div>
            <p className="mt-1 text-[11px] text-emerald-900/90">
              {blockStrategy
                ? "block 策略：未修改目标文件。切换 overwrite / merge 可继续操作。"
                : "请在目标仓手动 git commit。切换目标仓/分支可 promote 到其他路径。"}
            </p>
          </div>
        ) : !confirmOpen ? (
          <button
            type="button"
            disabled={
              promoting ||
              loadingPreview ||
              !preview ||
              graphGatePending ||
              (conflictAction === "merge" && graphGatePending)
            }
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl bg-indigo-900 px-4 py-2 text-sm text-white disabled:opacity-40"
          >
            {conflictAction === "overwrite"
              ? "确认覆盖"
              : conflictAction === "merge"
                ? "确认合并版"
                : "确认 promote 图谱"}
          </button>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-950">
            <p>
              {conflictAction === "overwrite"
                ? "将覆盖目标业务仓 _tech_graph 文件。不会自动 git commit。"
                : conflictAction === "merge"
                  ? "将落盘合并版到业务仓 _tech_graph。不会自动 git commit。"
                  : "将复制 graph_delta 到业务仓 _tech_graph。不会自动 git commit。"}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => void handlePromote()}
                disabled={promoting}
                className="rounded-lg bg-indigo-900 px-3 py-1.5 text-xs text-white disabled:opacity-40"
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
