"use client";

import { chainTimelineExpandBtnClass } from "@/components/chain-chat/ChainTimeline";
import type { ExecSection } from "@/lib/unified-chat/executionTrace";
import { phaseHintCn } from "@/lib/unified-chat/executionTrace";
type Props = {
  loading: boolean;
  queryTextTrace: string;
  execSections: ExecSection[];
  copyLabel: string;
  onCopy: () => void;
};

export function UnifiedChatExecutionTracePanel({
  loading,
  queryTextTrace,
  execSections,
  copyLabel,
  onCopy,
}: Props) {
  return (
    <section className="flex min-h-[72vh] min-w-0 flex-col rounded-2xl border border-[color:var(--color-border)] bg-white/40">
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-serif text-sm text-[#2c2c2c]">执行链路</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            按 SSE 顺序展示 Agent 子步与决策（每段 <span className="font-mono">agent.llm.*</span>{" "}
            单独成块，不混拼）；明细见左侧 Timeline
          </div>
        </div>
        <button
          type="button"
          className={chainTimelineExpandBtnClass}
          onClick={() => void onCopy()}
          title="复制当前执行链路摘要（纯文本）"
        >
          {copyLabel}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
        {!queryTextTrace.trim() && execSections.length === 0 ? (
          <p className="text-[12px] leading-relaxed text-slate-500">
            {loading ? "等待事件流…" : "发送问题后，此处展示执行链路摘要。"}
          </p>
        ) : (
          <div className="space-y-4 text-slate-800">
            {queryTextTrace.trim() ? (
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Query
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{queryTextTrace}</div>
              </div>
            ) : null}
            {execSections.map((s, idx) => (
              <div key={`${s.kind}-${idx}`} className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-600">step-{idx + 1}:</div>
                {s.kind === "llm_block" ? (
                  <div className="space-y-1 border-l-2 border-indigo-200 pl-2">
                    <div className="font-mono text-[11px] text-indigo-900">
                      agent.llm.start · {s.phase}（{phaseHintCn(s.phase)}）
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                      {s.body.trim() ? s.body : "（无 delta 正文）"}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">
                      agent.llm.end · {s.phase} · {s.ok ? "ok" : "fail"}
                    </div>
                  </div>
                ) : null}
                {s.kind === "router" ? (
                  <div className="font-mono text-sm text-slate-900">
                    router.decision →{" "}
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-900">
                      {s.finalMode}
                    </span>
                  </div>
                ) : null}
                {s.kind === "intent" ? (
                  <div className="font-mono text-[12px] text-slate-800">
                    agent.intent · <span className="text-slate-900">{s.tool}</span>
                    <span className="text-slate-500"> · mode {s.mode}</span>
                    {s.pathSummary ? (
                      <span className="text-violet-900/90"> · {s.pathSummary}</span>
                    ) : null}
                  </div>
                ) : null}
                {s.kind === "think" ? (
                  <div className="space-y-1 text-sm">
                    <div className="font-mono text-[11px] text-slate-600">agent.think</div>
                    <div className="max-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200/80 bg-slate-50/80 px-2 py-1.5 text-[13px] leading-relaxed text-slate-900">
                      {s.thought || "—"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      tool <span className="font-mono">{s.tool || "—"}</span> · mode{" "}
                      <span className="font-mono">{s.mode || "—"}</span>
                    </div>
                  </div>
                ) : null}
                {s.kind === "clarify" ? (
                  <div className="space-y-2 border-l-2 border-amber-400/90 pl-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-amber-500/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
                        待您澄清
                      </span>
                      <span className="font-mono text-[11px] text-amber-900">agent.clarify</span>
                    </div>
                    <div className="text-[12px] font-medium text-slate-800">
                      {s.message.trim() ? s.message : "—"}
                    </div>
                    <div className="max-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded border border-amber-200/80 bg-amber-50/40 px-2 py-1.5 text-[13px] leading-relaxed text-slate-900">
                      {s.prompt_for_user.trim() ? s.prompt_for_user : "—"}
                    </div>
                  </div>
                ) : null}
                {s.kind === "plan_preview" ? (
                  <div className="space-y-2 border-l-2 border-indigo-400/90 pl-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-indigo-500/50 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-950">
                        方案预览
                      </span>
                      <span className="font-mono text-[11px] text-indigo-900">agent.plan.preview</span>
                      <span className="text-[10px] text-slate-500">
                        plan <span className="font-mono">{s.plan_id || "—"}</span> · tool{" "}
                        <span className="font-mono">{s.tool || "—"}</span>
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-indigo-900/90">
                        sql_draft
                      </div>
                      <div className="mt-1 max-h-[36vh] overflow-auto whitespace-pre-wrap break-words rounded border border-indigo-200/80 bg-indigo-50/40 px-2 py-1.5 font-mono text-[12px] leading-relaxed text-slate-900">
                        {s.sql_draft.trim() ? s.sql_draft : "—"}
                      </div>
                    </div>
                    {s.warningsLines.length > 0 ? (
                      <div>
                        <div className="text-[10px] font-medium text-slate-600">warnings</div>
                        <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-slate-800">
                          {s.warningsLines.map((w, wi) => (
                            <li key={`${wi}-${w.slice(0, 24)}`}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="text-[10px] text-slate-500">
                      TTL 约 {s.expires_in_sec}s（收到帧起算，以后端校验为准）
                    </div>
                  </div>
                ) : null}
                {s.kind === "tool_start" ? (
                  <div className="font-mono text-[12px] text-amber-900">tool.call.start · {s.tool}</div>
                ) : null}
                {s.kind === "text2sql_phase_start" ? (
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-indigo-900">
                    <span className="rounded-full border border-amber-300/70 bg-amber-50/90 px-2 py-0.5 text-[10px]">
                      text2sql.phase.start
                    </span>
                    <span>{s.phaseId}</span>
                    <span className="text-slate-600">
                      {s.phaseKind === "llm"
                        ? "· 模型"
                        : s.phaseKind === "db"
                          ? "· 数据库"
                          : "· IO/检索"}
                    </span>
                  </div>
                ) : null}
                {s.kind === "text2sql_phase_end" ? (
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-indigo-900">
                    <span className="rounded-full border border-emerald-300/70 bg-emerald-50/90 px-2 py-0.5 text-[10px]">
                      text2sql.phase.end
                    </span>
                    <span>{s.phaseId}</span>
                    <span className="text-slate-600">· 本段 {s.latencyMs} ms</span>
                  </div>
                ) : null}
                {s.kind === "tool_end" ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[12px] text-amber-900">tool.call.end · {s.tool}</span>
                      {s.latencyMs != null ? (
                        <span className="rounded-full border border-slate-300/80 bg-white/80 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                          {s.latencyMs} ms
                        </span>
                      ) : null}
                      {s.toolError ? (
                        <span className="rounded-full border border-rose-300/80 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-900">
                          工具返回 error
                        </span>
                      ) : (
                        <span className="rounded-full border border-emerald-300/60 bg-emerald-50/80 px-2 py-0.5 text-[10px] text-emerald-900">
                          无 error 字段
                        </span>
                      )}
                    </div>
                    {s.text2sqlPhasesMs && Object.keys(s.text2sqlPhasesMs).length > 0 ? (
                      <div className="rounded-lg border border-indigo-200/80 bg-indigo-50/50 px-2 py-1.5">
                        <div className="text-[10px] font-semibold text-indigo-900">
                          Text2SQL 分段耗时（终态 · text2sql_phases_ms）
                        </div>
                        <ul className="mt-1 space-y-0.5 font-mono text-[11px] text-indigo-950">
                          {Object.entries(s.text2sqlPhasesMs).map(([k, v]) => (
                            <li key={k} className="flex justify-between gap-2">
                              <span className="min-w-0 truncate" title={k}>
                                {k}
                              </span>
                              <span>{v} ms</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {s.toolError ? (
                      <div className="rounded-lg border border-rose-200/90 bg-rose-50/90 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-rose-950">
                        {s.toolError}
                      </div>
                    ) : null}
                    {s.snippet.trim() ? (
                      <div>
                        <div className="text-[10px] font-medium text-slate-500">output 摘要</div>
                        <div className="mt-0.5 max-h-[28vh] overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200/80 bg-slate-50/80 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-slate-700">
                          {s.snippet}
                        </div>
                      </div>
                    ) : !s.toolError ? (
                      <div className="text-[11px] text-slate-500">（无 output 摘要）</div>
                    ) : null}
                  </div>
                ) : null}
                {s.kind === "truncated" ? (
                  <div className="font-mono text-[11px] text-rose-800">
                    agent.llm.truncated · dropped={s.dropped} · {s.reason}
                  </div>
                ) : null}
                {s.kind === "error_line" ? (
                  <div className="space-y-2 rounded-lg border border-rose-200/90 bg-rose-50/70 px-2 py-2">
                    <div className="font-mono text-[11px] text-rose-900">
                      <span className="text-rose-700">error</span> ·{" "}
                      <span className="rounded bg-white/80 px-1 py-0.5">{s.stage}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-[12px] leading-relaxed text-rose-950">
                      {s.message}
                    </div>
                    {s.persistHint ? (
                      <div>
                        <div className="text-[10px] font-medium text-rose-800/90">
                          persist（done 同源摘要）
                        </div>
                        <pre className="mt-0.5 max-h-[22vh] overflow-auto whitespace-pre-wrap break-words rounded border border-rose-200/60 bg-white/90 p-2 font-mono text-[10px] text-rose-950">
                          {s.persistHint}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
