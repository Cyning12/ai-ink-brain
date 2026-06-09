"use client";

import { AGENT_PLAN_PREVIEW_TOOL_RAG } from "@/lib/unified-chat/sse";
import { safeStringify } from "@/lib/unified-chat/stringify";

export type PendingPlanConfirmState = {
  token: string;
  boundQuery: string;
  sessionId: string;
  expiresInSec: number;
  receivedAtMs: number;
  sqlDraft: string;
  rewriteQuery: string;
  plannedTopK: number | null;
  previewHeadlines: string[];
  warnings: unknown[];
  planId: string;
  tool: string;
};

type UnifiedChatPlanPreviewPanelProps = {
  pending: PendingPlanConfirmState;
  planPreviewTtlRemainingSec: number | null;
  loading: boolean;
  sessionId: string;
  onExecuteWithToken: () => void;
  onCancelAndResend: () => void;
};

/** 低置信 agent.plan.preview 确认条（RAG / Text2SQL） */
export function UnifiedChatPlanPreviewPanel({
  pending,
  planPreviewTtlRemainingSec,
  loading,
  sessionId,
  onExecuteWithToken,
  onCancelAndResend,
}: UnifiedChatPlanPreviewPanelProps) {
  return (
    <div className="space-y-2 rounded-xl border border-indigo-300/70 bg-indigo-50/50 px-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-[12px] font-semibold text-indigo-950">
          {pending.tool === AGENT_PLAN_PREVIEW_TOOL_RAG
            ? "低置信 · 预览 RAG 方案已就绪"
            : "低置信 · 预览 SQL 已就绪"}
        </div>
        {planPreviewTtlRemainingSec != null ? (
          <span className="rounded-full border border-indigo-400/40 bg-white/80 px-2 py-0.5 font-mono text-[10px] text-indigo-900">
            约 {planPreviewTtlRemainingSec}s 后过期
          </span>
        ) : null}
      </div>
      <p className="text-[11px] leading-relaxed text-slate-700">
        须使用与预览时相同的 <span className="font-mono">query</span> 与{" "}
        <span className="font-mono">session_id</span>。若修改输入框中的问题并点击「发送」，将丢弃本令牌。令牌过期后将自动以同问句重新请求（不带令牌）。
      </p>
      {planPreviewTtlRemainingSec === 0 && !loading ? (
        <p className="text-[11px] font-medium text-amber-900/90">令牌已过期，正在自动重新请求…</p>
      ) : null}
      {pending.tool === AGENT_PLAN_PREVIEW_TOOL_RAG ? (
        <div className="space-y-2 text-[11px] text-slate-800">
          <div>
            <div className="text-[10px] font-medium text-indigo-900/90">改写检索 query</div>
            <div className="mt-1 max-h-[20vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-indigo-200/80 bg-white/70 px-2 py-2 font-mono text-[11px] leading-relaxed text-slate-900">
              {pending.rewriteQuery.trim()
                ? pending.rewriteQuery
                : "（预览不可用：缺少 rewrite_query）"}
            </div>
          </div>
          {pending.plannedTopK != null ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500">计划条数 top_k</span>
              <span className="font-mono text-slate-900">{pending.plannedTopK}</span>
            </div>
          ) : null}
          {pending.previewHeadlines.length > 0 ? (
            <div>
              <div className="text-[10px] font-medium text-slate-600">标题级摘要</div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-slate-900">
                {pending.previewHeadlines.map((h, hi) => (
                  <li key={hi}>{h}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="max-h-[28vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-indigo-200/80 bg-white/70 px-2 py-2 font-mono text-[11px] text-slate-900">
          {pending.sqlDraft.trim() ? pending.sqlDraft : "（无 sql_draft）"}
        </div>
      )}
      {pending.warnings.length > 0 ? (
        <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-800">
          {pending.warnings.map((w, wi) => (
            <li key={wi}>{typeof w === "string" ? w : safeStringify(w)}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={
            loading ||
            sessionId !== pending.sessionId ||
            planPreviewTtlRemainingSec === 0
          }
          onClick={onExecuteWithToken}
          className="rounded-xl bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-800 disabled:opacity-40"
        >
          按预览执行
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onCancelAndResend}
          className="rounded-xl border border-[color:var(--color-border)] bg-white/70 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          取消（丢弃令牌）
        </button>
      </div>
    </div>
  );
}
