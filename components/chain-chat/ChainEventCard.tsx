"use client";

import { useMemo, useState } from "react";

import type { ChainEvent } from "@/components/chain-chat/types";
import { SqlResultTable } from "@/components/chain-chat/SqlResultTable";
import { SourceCitations } from "@/components/SourceCitations";
import type { SourceCitation } from "@/lib/chat/chatApi";

type Props = {
  event: ChainEvent;
};

function fmtTs(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  return d.toLocaleTimeString();
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function extractTextFromPayload(payload: Record<string, unknown>): string {
  const direct = typeof payload.text === "string" ? payload.text : "";
  if (direct.trim()) return direct;
  const answer = typeof payload.answer === "string" ? payload.answer : "";
  if (answer.trim()) return answer;
  const output =
    payload.output && typeof payload.output === "object"
      ? (payload.output as Record<string, unknown>)
      : null;
  const outAnswer = output && typeof output.answer === "string" ? output.answer : "";
  if (outAnswer.trim()) return outAnswer;
  return "";
}

function pickSourceTitle(s: unknown): string {
  if (!s || typeof s !== "object") return "source";
  const o = s as Record<string, unknown>;
  const filename = typeof o.filename === "string" ? o.filename : "";
  const path = typeof o.path === "string" ? o.path : "";
  const relativePath = typeof o.relativePath === "string" ? o.relativePath : "";
  const id = typeof o.id === "string" || typeof o.id === "number" ? String(o.id) : "";
  return (filename || path || relativePath || (id ? `source#${id}` : "") || "source").trim();
}

function pickSourceContent(s: unknown): string {
  if (!s || typeof s !== "object") return "";
  const o = s as Record<string, unknown>;
  const content = typeof o.content === "string" ? o.content : "";
  const snippet = typeof o.snippet === "string" ? o.snippet : "";
  return (content || snippet).trim();
}

async function copyToClipboard(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t) return false;
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    // 兜底：旧浏览器/权限失败时尝试 execCommand
    try {
      const el = document.createElement("textarea");
      el.value = t;
      el.setAttribute("readonly", "true");
      el.style.position = "fixed";
      el.style.top = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function badgeTone(type: ChainEvent["type"]): string {
  if (type === "error") return "bg-red-500/10 text-red-700 border-red-500/20";
  if (type.startsWith("tool.")) return "bg-slate-500/10 text-slate-700 border-slate-500/20";
  if (type === "sql.result") return "bg-indigo-500/10 text-indigo-700 border-indigo-500/20";
  if (type === "rag.sources") return "bg-teal-500/10 text-teal-800 border-teal-500/20";
  if (type === "latency") return "bg-sky-500/10 text-sky-800 border-sky-500/20";
  if (type.startsWith("chart.")) return "bg-amber-500/10 text-amber-800 border-amber-500/20";
  return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
}

export function ChainEventCard({ event }: Props) {
  const [open, setOpen] = useState(false);
  const [snippetOpen, setSnippetOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetContent, setSnippetContent] = useState("");
  const [copied, setCopied] = useState(false);

  const title = useMemo(() => {
    const p = event.payload ?? {};
    if (event.type === "user.message") return "user.message";
    if (event.type === "assistant.message") return "assistant.message";
    if (event.type === "sql.result") return "sql.result";
    if (event.type === "rag.sources") return "rag.sources";
    if (event.type === "latency") return "latency";
    if (event.type === "error") return "error";
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
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 font-mono text-red-700/90">
              stage
            </span>
            <span className="font-mono text-red-700/90">{stage || "unknown"}</span>
          </div>
          <div className="whitespace-pre-wrap text-sm text-red-700/90">{msg}</div>
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

