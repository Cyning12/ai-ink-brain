"use client";

import { useMemo, useState } from "react";

import type { ChainEvent } from "@/components/chain-chat/types";
import { AGENT_PLAN_PREVIEW_TOOL_RAG } from "@/lib/unified-chat/sse";
import { SqlResultTable } from "@/components/chain-chat/SqlResultTable";
import {
  chainEventFmtTs as fmtTs,
  chainEventSafeStringify as safeStringify,
  copyChainTextToClipboard as copyToClipboard,
  extractTextFromChainPayload as extractTextFromPayload,
  pickChainSourceContent as pickSourceContent,
  pickChainSourceTitle as pickSourceTitle,
} from "@/components/chain-chat/chain-event-card-utils";
import { extractText2sqlPhasesMsFromToolOutput } from "@/lib/unified-chat/text2sqlPhaseSse";
import { SourceCitations } from "@/components/SourceCitations";
import type { SourceCitation } from "@/lib/chat/chatApi";

type Props = {
  event: ChainEvent;
  /** 父级「全部展开/收起」：与 batchExpandOpen 同时更新时同步子卡片展开态 */
  batchExpandNonce?: number;
  batchExpandOpen?: boolean;
};

function badgeTone(type: ChainEvent["type"]): string {
  if (type === "error") return "bg-red-500/10 text-red-700 border-red-500/20";
  if (type.startsWith("tool.")) return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  if (type === "sql.result") return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
  if (type === "rag.sources") return "bg-teal-500/10 text-teal-800 border-teal-500/20";
  if (type === "latency") return "bg-sky-500/10 text-sky-800 border-sky-500/20";
  if (type.startsWith("chart.")) return "bg-amber-500/10 text-amber-800 border-amber-500/20";
  if (type === "agent.intent") return "bg-violet-500/10 text-violet-900 border-violet-500/25";
  if (type === "agent.clarify") return "bg-amber-500/15 text-amber-950 border-amber-500/40";
  if (type === "agent.plan.preview") return "bg-indigo-500/12 text-indigo-950 border-indigo-500/35";
  if (type.startsWith("agent.llm")) return "bg-cyan-500/10 text-cyan-900 border-cyan-500/25";
  if (type.startsWith("agent.debug")) return "bg-orange-500/10 text-orange-950 border-orange-500/25";
  if (type.startsWith("text2sql.phase")) return "bg-indigo-500/10 text-indigo-900 border-indigo-500/25";
  if (type.startsWith("agent.")) return "bg-fuchsia-500/10 text-fuchsia-900 border-fuchsia-500/20";
  return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
}

export function ChainEventCard({ event, batchExpandNonce, batchExpandOpen }: Props) {
  /** 批量展开由父级 key（含 nonce/open）驱动 remount，避免在 effect 内同步 setState */
  const [open, setOpen] = useState(
    batchExpandNonce !== undefined && batchExpandOpen !== undefined ? batchExpandOpen : false,
  );
  const [snippetOpen, setSnippetOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetContent, setSnippetContent] = useState("");
  const [copied, setCopied] = useState(false);

  const title = useMemo(() => {
    const p = event.payload ?? {};
    if (event.type === "user.message") return "user.message";
    if (event.type === "assistant.message") return "assistant.message";
    if (event.type === "agent.intent") {
      const name = typeof p.tool === "string" && p.tool.trim() ? p.tool : "intent";
      return `agent.intent · ${name}`;
    }
    if (event.type === "agent.llm.start") {
      const ph = typeof p.phase === "string" && p.phase.trim() ? p.phase : "llm";
      return `agent.llm.start · ${ph}`;
    }
    if (event.type === "agent.llm.delta") {
      const idx =
        typeof p.part_index === "number" && Number.isFinite(p.part_index)
          ? String(Math.round(p.part_index))
          : "?";
      return `agent.llm.delta · part ${idx}`;
    }
    if (event.type === "agent.llm.end") {
      const ph = typeof p.phase === "string" && p.phase.trim() ? p.phase : "llm";
      const ok = p.ok === false ? "fail" : "ok";
      return `agent.llm.end · ${ph} · ${ok}`;
    }
    if (event.type === "agent.llm.truncated") {
      const r = typeof p.reason === "string" && p.reason.trim() ? p.reason : "truncated";
      return `agent.llm.truncated · ${r}`;
    }
    if (event.type === "agent.debug.llm_prompts") {
      const sc = typeof p.scope === "string" && p.scope.trim() ? p.scope : "llm";
      const tn = typeof p.tool === "string" && p.tool.trim() ? p.tool : "";
      return tn ? `agent.debug.llm_prompts · ${sc} · ${tn}` : `agent.debug.llm_prompts · ${sc}`;
    }
    if (event.type === "agent.clarify") {
      const short = typeof p.message === "string" && p.message.trim() ? p.message.trim().slice(0, 48) : "clarify";
      return `agent.clarify · ${short}`;
    }
    if (event.type === "agent.plan.preview") {
      const pid = typeof p.plan_id === "string" && p.plan_id.trim() ? p.plan_id.trim().slice(0, 24) : "plan";
      const tn = typeof p.tool === "string" && p.tool.trim() ? p.tool.trim() : "tool";
      return `agent.plan.preview · ${tn} · ${pid}`;
    }
    if (event.type === "agent.think") {
      const tool = typeof p.selected_tool === "string" && p.selected_tool.trim() ? p.selected_tool : "?";
      return `agent.think · ${tool}`;
    }
    if (event.type === "sql.result") return "sql.result";
    if (event.type === "rag.sources") return "rag.sources";
    if (event.type === "latency") return "latency";
    if (event.type === "error") return "error";
    if (event.type === "text2sql.phase.start") {
      const pid = typeof p.phase_id === "string" && p.phase_id.trim() ? p.phase_id.trim() : "phase";
      const k = typeof p.phase_kind === "string" ? p.phase_kind : "?";
      return `text2sql.phase.start · ${pid} · ${k}`;
    }
    if (event.type === "text2sql.phase.end") {
      const pid = typeof p.phase_id === "string" && p.phase_id.trim() ? p.phase_id.trim() : "phase";
      return `text2sql.phase.end · ${pid}`;
    }
    if (event.type === "tool.call.end") {
      const er = p.error;
      const failed = typeof er === "string" && er.trim().length > 0;
      const name = typeof p.tool === "string" && p.tool.trim() ? p.tool : "tool";
      return `tool.call.end · ${name} · ${failed ? "fail" : "ok"}`;
    }
    if (event.type.startsWith("tool.")) {
      const name = typeof p.tool === "string" ? p.tool : typeof p.name === "string" ? p.name : "tool";
      return `${event.type} · ${name}`;
    }
    return event.type;
  }, [event]);

  const renderBody = () => {
    if (event.type === "user.message") {
      const t = extractTextFromPayload(event.payload);
      return <div className="whitespace-pre-wrap text-sm text-slate-800">{t}</div>;
    }
    if (event.type === "assistant.message") {
      const t = extractTextFromPayload(event.payload);
      return <div className="whitespace-pre-wrap text-sm text-slate-800">{t}</div>;
    }
    if (event.type === "sql.result") {
      const sql = typeof event.payload.sql === "string" ? event.payload.sql : "";
      const columns = Array.isArray(event.payload.columns) ? (event.payload.columns as string[]) : undefined;
      const rows = Array.isArray(event.payload.rows)
        ? (event.payload.rows as Array<Record<string, unknown>>)
        : undefined;
      return (
        <div className="space-y-3">
          {sql ? (
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-500">sql</div>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const ok = await copyToClipboard(sql);
                    setCopied(ok);
                    if (ok) window.setTimeout(() => setCopied(false), 1200);
                  }}
                  className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-white/80"
                  title="复制 SQL"
                >
                  {copied ? "已复制" : "复制"}
                </button>
              </div>
              <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[11px] text-slate-700">
                {sql}
              </pre>
            </div>
          ) : null}
          <SqlResultTable columns={columns} rows={rows} maxRows={20} />
        </div>
      );
    }
    if (event.type === "rag.sources") {
      const sources = Array.isArray(event.payload.sources)
        ? (event.payload.sources as unknown[])
        : [];
      // SourceCitations 使用 lib/chat/chatApi 的 SourceCitation 结构；这里做最小假设：后端 payload 兼容该结构
      return (
        <div className="space-y-2">
          <div className="text-[11px] text-slate-500">sources</div>
          <SourceCitations
            sources={sources as SourceCitation[]}
            onOpenSnippet={(s) => {
              setSnippetTitle(pickSourceTitle(s));
              setSnippetContent(pickSourceContent(s));
              setSnippetOpen(true);
            }}
          />
        </div>
      );
    }
    if (event.type === "agent.llm.start") {
      const p = event.payload ?? {};
      const phase = typeof p.phase === "string" ? p.phase : "—";
      const sid = typeof p.step_id === "string" ? p.step_id : "—";
      return (
        <div className="space-y-1 text-[11px] text-slate-700">
          <div>
            <span className="text-slate-500">phase</span>{" "}
            <span className="font-mono">{phase}</span>
          </div>
          <div>
            <span className="text-slate-500">step_id</span>{" "}
            <span className="break-all font-mono">{sid}</span>
          </div>
        </div>
      );
    }
    if (event.type === "agent.llm.delta") {
      const t = typeof event.payload.text === "string" ? event.payload.text : "";
      return (
        <div className="whitespace-pre-wrap font-mono text-[12px] text-slate-800">
          {t || "（空）"}
        </div>
      );
    }
    if (event.type === "agent.llm.end") {
      const p = event.payload ?? {};
      const ok = p.ok === false ? false : true;
      const sim = p.simulated_stream === true;
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="flex flex-wrap gap-2">
            <span
              className={[
                "rounded-full border px-2 py-0.5 font-mono",
                ok ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10",
              ].join(" ")}
            >
              ok={String(ok)}
            </span>
            {sim ? (
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-900">
                simulated_stream
              </span>
            ) : null}
          </div>
          <pre className="overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
            {safeStringify(event.payload)}
          </pre>
        </div>
      );
    }
    if (event.type === "agent.llm.truncated") {
      const p = event.payload ?? {};
      const dropped =
        typeof p.dropped_chars === "number" && Number.isFinite(p.dropped_chars)
          ? String(Math.round(p.dropped_chars))
          : "—";
      const reason = typeof p.reason === "string" ? p.reason : "—";
      return (
        <div className="space-y-1 text-[11px] text-slate-700">
          <div>
            <span className="text-slate-500">dropped_chars</span>{" "}
            <span className="font-mono">{dropped}</span>
          </div>
          <div>
            <span className="text-slate-500">reason</span>{" "}
            <span className="font-mono">{reason}</span>
          </div>
        </div>
      );
    }
    if (event.type === "agent.intent") {
      const p = event.payload ?? {};
      const tool = typeof p.tool === "string" ? p.tool : "—";
      const mode = typeof p.mode === "string" ? p.mode : "—";
      const conf = typeof p.confidence === "number" && Number.isFinite(p.confidence) ? p.confidence : null;
      const cacheRaw = p.cache;
      const cache = cacheRaw === "hit" || cacheRaw === "miss" ? cacheRaw : "—";
      const hash = typeof p.cache_key_hash === "string" && p.cache_key_hash.trim() ? p.cache_key_hash : "—";
      const lat = p.latency_ms;
      const latStr = typeof lat === "number" && Number.isFinite(lat) ? `${Math.round(lat)} ms` : "—";
      const kv = (k: string, v: string) => (
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] text-slate-500">{k}</div>
          <div className="break-all font-mono text-[11px] text-slate-700">{v}</div>
        </div>
      );
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="grid gap-1 rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
            {kv("tool", tool)}
            {kv("mode", mode)}
            {kv("confidence", conf == null ? "—" : String(conf))}
            {kv("cache", cache)}
            {kv("cache_key_hash", hash)}
            {kv("latency_ms", latStr)}
          </div>
          <details className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
            <summary className="cursor-pointer select-none text-[11px] text-slate-700">reasoning / fallback</summary>
            <div className="mt-2 space-y-1">
              <div className="text-[10px] text-slate-500">reasoning</div>
              <div className="whitespace-pre-wrap text-[11px] text-slate-700">
                {typeof p.reasoning === "string" && p.reasoning.trim() ? p.reasoning : "—"}
              </div>
              <div className="text-[10px] text-slate-500">fallback</div>
              <div className="font-mono text-[11px] text-slate-700">
                {typeof p.fallback === "string"
                  ? p.fallback || "—"
                  : p.fallback === null
                    ? "null"
                    : "—"}
              </div>
            </div>
          </details>
        </div>
      );
    }
    if (event.type === "agent.clarify") {
      const p = event.payload ?? {};
      const msg = typeof p.message === "string" ? p.message : "";
      const prompt = typeof p.prompt_for_user === "string" ? p.prompt_for_user : "";
      const stepNo = p.step_number;
      const stepStr =
        typeof stepNo === "number" && Number.isFinite(stepNo) ? String(Math.round(stepNo)) : "—";
      return (
        <div className="space-y-2 text-[11px] text-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-500/60 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-950">
              澄清中 · 待您确认
            </span>
            <span className="text-[10px] text-slate-500">step {stepStr}</span>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-amber-900/90">摘要</div>
            <div className="mt-1 rounded-lg border border-amber-200/70 bg-amber-50/50 px-2 py-1.5 text-[12px] leading-relaxed text-slate-900">
              {msg.trim() ? msg : "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-600">追问</div>
            <div className="mt-1 max-h-[42vh] overflow-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-slate-900">
              {prompt.trim() ? prompt : "—"}
            </div>
          </div>
        </div>
      );
    }
    if (event.type === "agent.plan.preview") {
      const p = event.payload ?? {};
      const sql = typeof p.sql_draft === "string" ? p.sql_draft : "";
      const rewriteQuery = typeof p.rewrite_query === "string" ? p.rewrite_query : "";
      const plannedTopK = p.planned_top_k;
      const headlines = Array.isArray(p.preview_headlines)
        ? p.preview_headlines.filter((h): h is string => typeof h === "string")
        : [];
      const warns = Array.isArray(p.warnings) ? p.warnings : [];
      const exp = p.expires_in_sec;
      const expStr = typeof exp === "number" && Number.isFinite(exp) ? String(Math.max(0, Math.floor(exp))) : "—";
      const pid = typeof p.plan_id === "string" ? p.plan_id : "";
      const tool = typeof p.tool === "string" ? p.tool : "";
      const isRag = tool === AGENT_PLAN_PREVIEW_TOOL_RAG;
      return (
        <div className="space-y-2 text-[11px] text-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-indigo-500/50 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-950">
              {isRag ? "RAG 方案预览（未执行）" : "方案预览（未执行）"}
            </span>
            <span className="text-[10px] text-slate-500">
              TTL 约 {expStr}s · plan_id <span className="font-mono">{pid || "—"}</span>
            </span>
          </div>
          <div className="grid gap-1 rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
            <div>
              <span className="text-slate-500">tool</span> {tool || "—"}
            </div>
          </div>
          {isRag ? (
            <div className="space-y-2">
              <div>
                <div className="text-[10px] font-medium text-indigo-900/90">rewrite_query</div>
                <div className="mt-1 max-h-[32vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-teal-200/70 bg-teal-50/40 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-slate-900">
                  {rewriteQuery.trim() ? rewriteQuery : "—"}
                </div>
              </div>
              {typeof plannedTopK === "number" && Number.isFinite(plannedTopK) ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] text-slate-500">planned_top_k</span>
                  <span className="font-mono text-slate-900">{Math.floor(plannedTopK)}</span>
                </div>
              ) : null}
              {headlines.length > 0 ? (
                <div>
                  <div className="text-[10px] font-medium text-slate-600">preview_headlines</div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-slate-900">
                    {headlines.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div>
              <div className="text-[10px] font-medium text-indigo-900/90">sql_draft</div>
              <div className="mt-1 max-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-indigo-200/70 bg-indigo-50/40 px-2 py-1.5 font-mono text-[11px] leading-relaxed text-slate-900">
                {sql.trim() ? sql : "—"}
              </div>
            </div>
          )}
          {warns.length > 0 ? (
            <div>
              <div className="text-[10px] font-medium text-slate-600">warnings</div>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[12px] leading-relaxed text-slate-900">
                {warns.map((w, i) => (
                  <li key={i}>{typeof w === "string" ? w : safeStringify(w)}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="text-[10px] text-slate-500">
            放行令牌不在 Timeline 展示；请在输入区使用「按预览执行」。
          </p>
        </div>
      );
    }
    if (event.type === "agent.think") {
      const p = event.payload ?? {};
      const thought = typeof p.thought === "string" ? p.thought : "";
      const tool = typeof p.selected_tool === "string" ? p.selected_tool : "—";
      const mode = typeof p.mode === "string" ? p.mode : "—";
      const stepNo = p.step_number;
      const stepStr =
        typeof stepNo === "number" && Number.isFinite(stepNo) ? String(Math.round(stepNo)) : "—";
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="grid gap-1 rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[10px] text-slate-500">step</span>
              <span className="font-mono">{stepStr}</span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[10px] text-slate-500">tool</span>
              <span className="font-mono">{tool}</span>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[10px] text-slate-500">mode</span>
              <span className="font-mono">{mode}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">thought</div>
            <div className="mt-1 max-h-[42vh] overflow-auto whitespace-pre-wrap break-words text-[12px] leading-relaxed text-slate-900">
              {thought.trim() ? thought : "—"}
            </div>
          </div>
        </div>
      );
    }
    if (event.type === "agent.debug.llm_prompts") {
      const p = event.payload ?? {};
      const items = Array.isArray(p.items) ? (p.items as unknown[]) : [];
      const scope = typeof p.scope === "string" ? p.scope : "—";
      const stepNo = p.step_number;
      const stepStr =
        typeof stepNo === "number" && Number.isFinite(stepNo) ? String(Math.round(stepNo)) : "—";
      const fullJson = safeStringify(p);
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
            <span>
              scope=<span className="font-mono text-slate-700">{scope}</span>
            </span>
            {typeof p.tool === "string" && p.tool.trim() ? (
              <span>
                tool=<span className="font-mono text-slate-700">{p.tool}</span>
              </span>
            ) : null}
            <span>
              step=<span className="font-mono text-slate-700">{stepStr}</span>
            </span>
            <span>段数 {items.length}</span>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const ok = await copyToClipboard(fullJson);
                setCopied(ok);
                if (ok) window.setTimeout(() => setCopied(false), 1200);
              }}
              className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-white/80"
              title="复制本事件完整 JSON"
            >
              {copied ? "已复制" : "复制 JSON"}
            </button>
          </div>
          <div className="max-h-[48vh] space-y-2 overflow-auto">
            {items.map((it, idx) => {
              const row = it && typeof it === "object" ? (it as Record<string, unknown>) : {};
              const phase = typeof row.phase === "string" ? row.phase : `段 ${idx + 1}`;
              const model = typeof row.model === "string" ? row.model : "";
              return (
                <details key={`${phase}:${idx}`} className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
                  <summary className="cursor-pointer select-none font-mono text-[11px] text-slate-800">
                    {phase}
                    {model ? <span className="ml-2 text-[10px] text-slate-500">{model}</span> : null}
                  </summary>
                  <pre className="mt-2 max-h-[32vh] overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] text-slate-700">
                    {safeStringify(row)}
                  </pre>
                </details>
              );
            })}
          </div>
        </div>
      );
    }
    if (event.type === "latency") {
      const total =
        typeof event.payload.total_ms === "number" ? event.payload.total_ms : null;
      const stages =
        event.payload.stages_ms && typeof event.payload.stages_ms === "object"
          ? (event.payload.stages_ms as Record<string, unknown>)
          : null;
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="font-mono">
            total_ms: {total == null ? "—" : String(Math.round(total))}
          </div>
          {stages ? (
            <pre className="overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
              {safeStringify(stages)}
            </pre>
          ) : null}
        </div>
      );
    }
    if (event.type === "router.evidence") {
      const p = event.payload ?? {};
      const candidateMode = typeof p.candidate_mode === "string" ? p.candidate_mode : "";
      const finalMode = typeof p.final_mode === "string" ? p.final_mode : "";
      const fallback =
        typeof p.fallback === "string" ? p.fallback : p.fallback === null ? null : undefined;

      const ddl = p.ddl && typeof p.ddl === "object" ? (p.ddl as Record<string, unknown>) : null;
      const fts = p.fts && typeof p.fts === "object" ? (p.fts as Record<string, unknown>) : null;

      const ddlHits = ddl && typeof ddl.hits === "number" ? ddl.hits : null;
      const ddlTopScore = ddl && typeof ddl.top_score === "number" ? ddl.top_score : null;
      const ddlTopk = ddl && typeof ddl.topk === "number" ? ddl.topk : null;
      const ddlMinScore = ddl && typeof ddl.min_score === "number" ? ddl.min_score : null;

      const ftsHits = fts && typeof fts.hits === "number" ? fts.hits : null;
      const ftsTop1Score = fts && typeof fts.top1_score === "number" ? fts.top1_score : null;
      const ftsTopk = fts && typeof fts.topk === "number" ? fts.topk : null;

      const kv = (k: string, v: string) => (
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] text-slate-500">{k}</div>
          <div className="font-mono text-[11px] text-slate-700">{v || "—"}</div>
        </div>
      );

      const num = (v: number | null) => (v == null || !Number.isFinite(v) ? "—" : String(v));

      return (
        <div className="space-y-3">
          <div className="grid gap-2 rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
            {kv("candidate_mode", candidateMode)}
            {kv("final_mode", finalMode)}
            <div className="flex items-center justify-between gap-3">
              <div className="text-[10px] text-slate-500">fallback</div>
              <div className="font-mono text-[11px] text-slate-700">
                {typeof fallback === "string" ? (fallback.trim() ? fallback : "—") : fallback === null ? "null" : "—"}
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
              <div className="text-[10px] text-slate-500">DDL evidence</div>
              <div className="mt-2 space-y-1">
                {kv("hits", num(ddlHits))}
                {kv("top_score", num(ddlTopScore))}
                {kv("topk", num(ddlTopk))}
                {kv("min_score", num(ddlMinScore))}
              </div>
            </div>
            <div className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
              <div className="text-[10px] text-slate-500">FTS evidence</div>
              <div className="mt-2 space-y-1">
                {kv("hits", num(ftsHits))}
                {kv("top1_score", num(ftsTop1Score))}
                {kv("topk", num(ftsTopk))}
              </div>
            </div>
          </div>

          <details className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
            <summary className="cursor-pointer select-none text-[11px] text-slate-700">
              raw payload
            </summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/60 p-2 font-mono text-[10px] text-slate-700">
              {safeStringify(event.payload)}
            </pre>
          </details>
        </div>
      );
    }
    if (event.type === "router.evidence.details") {
      const p = event.payload ?? {};
      const candidateMode = typeof p.candidate_mode === "string" ? p.candidate_mode : "";
      const finalMode = typeof p.final_mode === "string" ? p.final_mode : "";
      const fallback =
        typeof p.fallback === "string" ? p.fallback : p.fallback === null ? null : undefined;

      const ddl = p.ddl && typeof p.ddl === "object" ? (p.ddl as Record<string, unknown>) : null;
      const fts = p.fts && typeof p.fts === "object" ? (p.fts as Record<string, unknown>) : null;

      const pickCandidates = (obj: Record<string, unknown> | null): unknown[] => {
        if (!obj) return [];
        const direct = obj.candidates;
        if (Array.isArray(direct)) return direct as unknown[];
        const hits = obj.hits_list;
        if (Array.isArray(hits)) return hits as unknown[];
        const matches = obj.matches;
        if (Array.isArray(matches)) return matches as unknown[];
        return [];
      };

      const ddlCandidates = pickCandidates(ddl);
      const ftsCandidates = pickCandidates(fts);

      const num = (v: unknown): string => (typeof v === "number" && Number.isFinite(v) ? String(v) : "—");
      const text = (v: unknown): string => (typeof v === "string" && v.trim() ? v.trim() : "—");

      return (
        <div className="space-y-3">
          <div className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
            <div className="grid gap-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-500">candidate_mode</div>
                <div className="font-mono text-[11px] text-slate-700">{text(candidateMode)}</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-500">final_mode</div>
                <div className="font-mono text-[11px] text-slate-700">{text(finalMode)}</div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] text-slate-500">fallback</div>
                <div className="font-mono text-[11px] text-slate-700">
                  {typeof fallback === "string" ? (fallback.trim() ? fallback : "—") : fallback === null ? "null" : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
              <div className="text-[10px] text-slate-500">DDL details</div>
              {ddl ? (
                <div className="mt-2 space-y-2">
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500">hits</div>
                      <div className="font-mono text-[11px] text-slate-700">{num(ddl.hits)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500">top_score</div>
                      <div className="font-mono text-[11px] text-slate-700">{num(ddl.top_score)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500">min_score</div>
                      <div className="font-mono text-[11px] text-slate-700">{num(ddl.min_score)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500">topk</div>
                      <div className="font-mono text-[11px] text-slate-700">{num(ddl.topk)}</div>
                    </div>
                  </div>
                  {ddlCandidates.length ? (
                    <details className="rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/60 p-2">
                      <summary className="cursor-pointer select-none text-[11px] text-slate-700">
                        candidates ({ddlCandidates.length})
                      </summary>
                      <pre className="mt-2 max-h-[26vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                        {safeStringify(ddlCandidates)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-slate-500">（无 DDL details）</div>
              )}
            </div>

            <div className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
              <div className="text-[10px] text-slate-500">FTS details</div>
              {fts ? (
                <div className="mt-2 space-y-2">
                  <div className="grid gap-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500">hits</div>
                      <div className="font-mono text-[11px] text-slate-700">{num(fts.hits)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500">top1_score</div>
                      <div className="font-mono text-[11px] text-slate-700">{num(fts.top1_score)}</div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] text-slate-500">topk</div>
                      <div className="font-mono text-[11px] text-slate-700">{num(fts.topk)}</div>
                    </div>
                  </div>
                  {ftsCandidates.length ? (
                    <details className="rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/60 p-2">
                      <summary className="cursor-pointer select-none text-[11px] text-slate-700">
                        candidates ({ftsCandidates.length})
                      </summary>
                      <pre className="mt-2 max-h-[26vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                        {safeStringify(ftsCandidates)}
                      </pre>
                    </details>
                  ) : null}
                </div>
              ) : (
                <div className="mt-2 text-[11px] text-slate-500">（无 FTS details）</div>
              )}
            </div>
          </div>

          <details className="rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
            <summary className="cursor-pointer select-none text-[11px] text-slate-700">
              raw payload
            </summary>
            <pre className="mt-2 max-h-[30vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/60 p-2 font-mono text-[10px] text-slate-700">
              {safeStringify(event.payload)}
            </pre>
          </details>
        </div>
      );
    }
    if (event.type === "chart.image") {
      const src = typeof event.payload.src === "string" ? event.payload.src : "";
      const alt = typeof event.payload.alt === "string" ? event.payload.alt : "chart";
      if (!src) return <div className="text-[11px] text-slate-500">（无图表）</div>;
      return (
        <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="h-auto w-full" />
        </div>
      );
    }
    if (event.type === "chart.spec") {
      return (
        <pre className="overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[11px] text-slate-700">
          {safeStringify(event.payload)}
        </pre>
      );
    }
    if (event.type === "tool.call.start") {
      const p = event.payload ?? {};
      const tool = typeof p.tool === "string" ? p.tool : "—";
      const inp = p.input;
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div>
            <span className="text-slate-500">tool</span>{" "}
            <span className="font-mono text-slate-900">{tool}</span>
          </div>
          {inp && typeof inp === "object" ? (
            <div>
              <div className="text-[10px] text-slate-500">input</div>
              <pre className="mt-1 max-h-[28vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/70 p-2 font-mono text-[10px] text-slate-800">
                {safeStringify(inp)}
              </pre>
            </div>
          ) : (
            <div className="text-[10px] text-slate-500">（无 input）</div>
          )}
        </div>
      );
    }
    if (event.type === "text2sql.phase.start") {
      const p = event.payload ?? {};
      const phaseId = typeof p.phase_id === "string" ? p.phase_id : "—";
      const kind = typeof p.phase_kind === "string" ? p.phase_kind : "—";
      const kindLabel =
        kind === "llm" ? "模型（LLM）" : kind === "db" ? "数据库" : kind === "io" ? "IO / 检索" : kind;
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-amber-300/70 bg-amber-50/90 px-2 py-0.5 font-mono text-[10px] text-amber-900">
              进行中
            </span>
            <span className="text-slate-500">phase_id</span>
            <span className="font-mono text-slate-900">{phaseId}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">phase_kind</span>
            <span className="rounded-full border border-indigo-300/60 bg-indigo-50/90 px-2 py-0.5 font-mono text-[10px] text-indigo-900">
              {kindLabel}
            </span>
          </div>
        </div>
      );
    }
    if (event.type === "text2sql.phase.end") {
      const p = event.payload ?? {};
      const phaseId = typeof p.phase_id === "string" ? p.phase_id : "—";
      const lat = p.latency_ms;
      const latStr = typeof lat === "number" && Number.isFinite(lat) ? `${Math.round(lat)} ms` : "—";
      return (
        <div className="space-y-1 text-[11px] text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-300/70 bg-emerald-50/90 px-2 py-0.5 font-mono text-[10px] text-emerald-900">
              子阶段完成
            </span>
            <span className="font-mono text-slate-900">{phaseId}</span>
            <span className="text-slate-500">本段</span>
            <span className="font-mono text-slate-900">{latStr}</span>
          </div>
          <p className="text-[10px] text-slate-500">
            终态「分段 ms」汇总以 <span className="font-mono">tool.call.end.output.text2sql_phases_ms</span> 为准。
          </p>
        </div>
      );
    }
    if (event.type === "tool.call.end") {
      const p = event.payload ?? {};
      const err = typeof p.error === "string" ? p.error.trim() : "";
      const lat = p.latency_ms;
      const latStr = typeof lat === "number" && Number.isFinite(lat) ? `${Math.round(lat)} ms` : "—";
      const out = p.output;
      const phasesMs = extractText2sqlPhasesMsFromToolOutput(out);
      return (
        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500">latency</span>
            <span className="font-mono text-slate-900">{latStr}</span>
            {err ? (
              <span className="rounded-full border border-rose-300/80 bg-rose-50 px-2 py-0.5 text-[10px] font-medium text-rose-900">
                含 error
              </span>
            ) : (
              <span className="rounded-full border border-emerald-300/70 bg-emerald-50/80 px-2 py-0.5 text-[10px] text-emerald-900">
                无 error
              </span>
            )}
          </div>
          {phasesMs ? (
            <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-2">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-indigo-900">
                Text2SQL 分段耗时（终态 · text2sql_phases_ms）
              </div>
              <ul className="mt-1.5 space-y-0.5 font-mono text-[11px] text-indigo-950">
                {Object.entries(phasesMs).map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate" title={k}>
                      {k}
                    </span>
                    <span>{v} ms</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {err ? (
            <div>
              <div className="text-[10px] text-rose-800">error（工具层原文）</div>
              <div className="mt-1 whitespace-pre-wrap break-words rounded-lg border border-rose-200/90 bg-rose-50/90 px-2 py-1.5 font-mono text-[11px] text-rose-950">
                {err}
              </div>
            </div>
          ) : null}
          <div>
            <div className="text-[10px] text-slate-500">output</div>
            <pre className="mt-1 max-h-[32vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/70 p-2 font-mono text-[10px] text-slate-800">
              {out !== undefined && out !== null ? safeStringify(out) : "（空）"}
            </pre>
          </div>
        </div>
      );
    }
    if (event.type === "error") {
      const stage =
        typeof event.payload.stage === "string"
          ? event.payload.stage
          : typeof event.payload.step === "string"
            ? event.payload.step
            : typeof event.payload.step_id === "string"
              ? event.payload.step_id
              : event.step_id;
      const msg =
        typeof event.payload.message === "string"
          ? event.payload.message
          : safeStringify(event.payload);
      const persist = (event.payload as Record<string, unknown>).persist;
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 font-mono text-red-700/90">
              stage
            </span>
            <span className="font-mono text-red-700/90">{stage || "unknown"}</span>
          </div>
          <div className="whitespace-pre-wrap text-sm text-red-700/90">{msg}</div>
          {persist && typeof persist === "object" && !Array.isArray(persist) ? (
            <details className="rounded-xl border border-red-200/60 bg-white/60 p-2">
              <summary className="cursor-pointer select-none text-[11px] text-red-900/90">persist 详情</summary>
              <pre className="mt-2 max-h-[36vh] overflow-auto whitespace-pre-wrap break-words font-mono text-[10px] text-red-950">
                {safeStringify(persist)}
              </pre>
            </details>
          ) : null}
        </div>
      );
    }
    // tool.* and fallback
    return (
      <pre className="overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[11px] text-slate-700">
        {safeStringify(event.payload)}
      </pre>
    );
  };

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7] p-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={[
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono",
                badgeTone(event.type),
              ].join(" ")}
            >
              {event.type}
            </span>
            <span className="truncate font-serif text-[12px] text-[#2c2c2c]">
              {title}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">
            {fmtTs(event.ts)} · run={event.run_id} · step={event.step_id}
          </div>
        </div>
        <span className="shrink-0 text-[10px] text-slate-400">{open ? "收起" : "展开"}</span>
      </button>

      {open ? <div className="mt-3">{renderBody()}</div> : null}

      {snippetOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSnippetOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7] p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-serif text-sm text-[#2c2c2c]">{snippetTitle || "摘要"}</div>
                <div className="mt-1 text-[11px] text-slate-500">点击遮罩或右上角关闭</div>
              </div>
              <button
                type="button"
                className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-1 text-[11px] text-slate-600 hover:bg-white/80"
                onClick={() => setSnippetOpen(false)}
              >
                关闭
              </button>
            </div>
            <div className="mt-3">
              {snippetContent ? (
                <pre className="max-h-[55vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-3 font-mono text-[11px] text-slate-700">
                  {snippetContent}
                </pre>
              ) : (
                <div className="text-[12px] text-slate-500">（该 sources 未提供 snippet/content）</div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

