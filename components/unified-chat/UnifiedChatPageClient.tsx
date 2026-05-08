"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useSessionId } from "@/lib/hooks/useSessionId";
import type { ChainEvent } from "@/components/chain-chat/types";
import { ChainTimeline, chainTimelineExpandBtnClass } from "@/components/chain-chat/ChainTimeline";

const LS_TOKEN_KEY = "blog_admin_token";
/** Unified Chat 增量 SSE 契约版本（须与 BFF / Python 一致） */
const SSE_CONTRACT_HEADER = "X-ChatBI-Sse-Contract";
const SSE_CONTRACT_V2 = "2";

type PreferMode = "auto" | "rag" | "text2sql";

type ChatRow = { id: string; role: "user" | "assistant"; text: string };

function readToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_TOKEN_KEY)?.trim() ?? "";
}

function writeToken(token: string) {
  if (typeof window === "undefined") return;
  const t = token.trim();
  if (!t) localStorage.removeItem(LS_TOKEN_KEY);
  else localStorage.setItem(LS_TOKEN_KEY, t);
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

/** 按 SSE append 顺序拼接 LLM 子步增量（v1 不做 step 聚合卡片） */
/** 单段 LLM：仅拼接相邻 delta（由 start/end 界定，避免跨 phase 混拼） */
function joinLlmDeltasInRange(events: ChainEvent[], startIdx: number, endIdx: number): string {
  let out = "";
  for (let i = startIdx; i <= endIdx; i += 1) {
    const e = events[i];
    if (!e || e.type !== "agent.llm.delta") continue;
    const t = typeof e.payload.text === "string" ? e.payload.text : "";
    out += t;
  }
  return out;
}

function phaseHintCn(phase: string): string {
  const p = phase.trim().toLowerCase();
  if (p === "intent") return "使用 LLM 意图识别";
  if (p === "direct") return "直接生成";
  if (p === "rag_generate") return "RAG 生成";
  if (p === "text2sql_sql") return "Text2SQL SQL";
  if (p === "text2sql_summary") return "Text2SQL 总结";
  return phase || "LLM 子步";
}

/** 右栏「执行链路」：按 SSE 顺序抽取决策/子步，便于阅读（非全局 delta 混拼） */
type ExecSection =
  | { kind: "llm_block"; phase: string; body: string; ok: boolean }
  | { kind: "router"; finalMode: string }
  | { kind: "intent"; tool: string; mode: string }
  | { kind: "think"; thought: string; tool: string; mode: string }
  | { kind: "tool_start"; tool: string }
  | { kind: "tool_end"; tool: string; snippet: string }
  | { kind: "truncated"; reason: string; dropped: number }
  | { kind: "error_line"; stage: string; message: string };

function buildExecutionTraceSections(events: ChainEvent[]): ExecSection[] {
  const out: ExecSection[] = [];
  let i = 0;
  while (i < events.length) {
    const e = events[i];
    if (!e) {
      i += 1;
      continue;
    }
    if (e.type === "user.message" || e.type === "meta") {
      i += 1;
      continue;
    }
    if (e.type === "agent.step.start" || e.type === "agent.step.end") {
      i += 1;
      continue;
    }
    if (e.type === "agent.llm.start") {
      const phase = typeof e.payload.phase === "string" ? e.payload.phase.trim() : "";
      let j = i + 1;
      let endIdx = -1;
      let ok = true;
      while (j < events.length) {
        const x = events[j];
        if (x.type === "agent.llm.end") {
          const o = x.payload.ok;
          ok = typeof o === "boolean" ? o : true;
          endIdx = j;
          break;
        }
        if (x.type === "agent.llm.start") break;
        j += 1;
      }
      if (endIdx < 0) {
        out.push({ kind: "llm_block", phase: phase || "?", body: "", ok: false });
        i += 1;
        continue;
      }
      const body = joinLlmDeltasInRange(events, i + 1, endIdx - 1);
      out.push({ kind: "llm_block", phase: phase || "?", body, ok });
      i = endIdx + 1;
      continue;
    }
    if (e.type === "agent.llm.delta" || e.type === "agent.llm.end") {
      i += 1;
      continue;
    }
    if (e.type === "agent.llm.truncated") {
      const reason = typeof e.payload.reason === "string" ? e.payload.reason : "unknown";
      const dr = e.payload.dropped_chars;
      const dropped = typeof dr === "number" && Number.isFinite(dr) ? dr : 0;
      out.push({ kind: "truncated", reason, dropped });
      i += 1;
      continue;
    }
    if (e.type === "router.decision") {
      const fm =
        typeof e.payload.final_mode === "string" && e.payload.final_mode.trim()
          ? e.payload.final_mode.trim()
          : "—";
      out.push({ kind: "router", finalMode: fm });
      i += 1;
      continue;
    }
    if (e.type === "agent.intent") {
      const tool = typeof e.payload.tool === "string" ? e.payload.tool : "—";
      const mode = typeof e.payload.mode === "string" ? e.payload.mode : "—";
      out.push({ kind: "intent", tool, mode });
      i += 1;
      continue;
    }
    if (e.type === "agent.think") {
      const thought = typeof e.payload.thought === "string" ? e.payload.thought : "";
      const tool = typeof e.payload.selected_tool === "string" ? e.payload.selected_tool : "";
      const mode = typeof e.payload.mode === "string" ? e.payload.mode : "";
      out.push({ kind: "think", thought, tool, mode });
      i += 1;
      continue;
    }
    if (e.type === "tool.call.start") {
      const tool = typeof e.payload.tool === "string" ? e.payload.tool : "—";
      out.push({ kind: "tool_start", tool });
      i += 1;
      continue;
    }
    if (e.type === "tool.call.end") {
      const snippet = extractTextFromPayload(e.payload).slice(0, 200);
      let toolName = "tool";
      for (let k = i - 1; k >= 0; k -= 1) {
        const ev = events[k];
        if (!ev) break;
        if (ev.type === "tool.call.start") {
          const t = ev.payload.tool;
          if (typeof t === "string" && t.trim()) toolName = t.trim();
          break;
        }
      }
      out.push({ kind: "tool_end", tool: toolName, snippet });
      i += 1;
      continue;
    }
    if (e.type === "error") {
      const stage = typeof e.payload.stage === "string" ? e.payload.stage : "error";
      const message = typeof e.payload.message === "string" ? e.payload.message : "";
      out.push({ kind: "error_line", stage, message });
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

function extractUserQueryText(events: ChainEvent[]): string {
  const u = events.find((x) => x.type === "user.message");
  const t = u && typeof u.payload.text === "string" ? u.payload.text : "";
  return t.trim();
}

function pickErrorMessage(raw: string, status: number, statusText: string): string {
  const t = raw.trim();
  const j = safeJson(raw);
  if (j && typeof j === "object") {
    const obj = j as { detail?: unknown; error?: unknown };
    if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail.trim();
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim();
  }
  return t || `${status} ${statusText}`;
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

function extractMessagesFromEvents(events: ChainEvent[]): ChatRow[] {
  const out: ChatRow[] = [];
  for (const e of [...events].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))) {
    if (e.type !== "user.message" && e.type !== "assistant.message") continue;
    const text = extractTextFromPayload(e.payload);
    if (!text.trim()) continue;
    out.push({
      id: `${e.run_id}:${e.step_id}:${e.ts}:${e.type}`,
      role: e.type === "user.message" ? "user" : "assistant",
      text,
    });
  }
  return out;
}

function extractFinalAnswer(args: {
  answer?: string;
  events: ChainEvent[];
}): string {
  const direct = typeof args.answer === "string" ? args.answer : "";
  if (direct.trim()) return direct.trim();

  // 1) 最后一个 assistant.message（兼容 payload.text / payload.answer / payload.output.answer）
  const lastAssistant = [...args.events]
    .filter((e) => e.type === "assistant.message")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (lastAssistant) {
    const t = extractTextFromPayload(lastAssistant.payload);
    if (t.trim()) return t.trim();
  }

  // 2) 兜底：最后一个 tool.call.end 的 output.answer（截图里常见这种）
  const lastToolEnd = [...args.events]
    .filter((e) => e.type === "tool.call.end")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (lastToolEnd) {
    const t = extractTextFromPayload(lastToolEnd.payload);
    if (t.trim()) return t.trim();
  }

  return "";
}

type SseBlock = { event: string; data: string };

function parseSseBlocks(chunkText: string): SseBlock[] {
  // 这里只做“块级解析”；事件的组包（跨 chunk）由外层 buffer 处理
  const blocks: SseBlock[] = [];
  const parts = chunkText.split("\n\n").filter((p) => p.trim());
  for (const part of parts) {
    let eventName = "message";
    const dataLines: string[] = [];
    for (const rawLine of part.split("\n")) {
      const line = rawLine.trimEnd();
      if (!line) continue;
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim() || "message";
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
        continue;
      }
      // 忽略 id/retry 等
    }
    blocks.push({ event: eventName, data: dataLines.join("\n") });
  }
  return blocks;
}

function chainEventFromSse(args: {
  runId: string;
  raw: unknown;
  fallbackStepId: string;
}): ChainEvent | null {
  if (!args.raw || typeof args.raw !== "object") return null;
  const obj = args.raw as Record<string, unknown>;

  const type = typeof obj.type === "string" ? obj.type : "";
  if (!type) return null;

  // vNext §5.4：delta 缺 text 则跳过该帧
  if (type === "agent.llm.delta") {
    const pl = obj.payload;
    if (!pl || typeof pl !== "object") return null;
    const rec = pl as Record<string, unknown>;
    if (typeof rec.text !== "string") return null;
  }

  const ts = typeof obj.ts === "number" && Number.isFinite(obj.ts) ? obj.ts : Date.now();
  const stepId =
    typeof obj.step_id === "string" && obj.step_id
      ? obj.step_id
      : typeof obj.step === "string" && obj.step
        ? obj.step
        : args.fallbackStepId;
  const payload =
    obj.payload && typeof obj.payload === "object"
      ? (obj.payload as Record<string, unknown>)
      : {};

  return {
    type: type as ChainEvent["type"],
    ts,
    run_id: args.runId,
    step_id: stepId,
    payload,
  } as ChainEvent;
}

type RouterDecision = {
  prefer?: string;
  candidate_mode?: string;
  final_mode?: string;
  rule_hits?: string[];
  evidence?: Record<string, unknown>;
  fallback?: string | null;
};

function extractRouterDecision(events: ChainEvent[]): RouterDecision | null {
  const last = [...events]
    .filter((e) => e.type === "router.decision")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (!last) return null;
  const p = last.payload ?? {};
  if (!p || typeof p !== "object") return null;
  const obj = p as Record<string, unknown>;
  return {
    prefer: typeof obj.prefer === "string" ? obj.prefer : undefined,
    candidate_mode: typeof obj.candidate_mode === "string" ? obj.candidate_mode : undefined,
    final_mode: typeof obj.final_mode === "string" ? obj.final_mode : undefined,
    rule_hits: Array.isArray(obj.rule_hits) ? (obj.rule_hits as string[]) : undefined,
    evidence:
      obj.evidence && typeof obj.evidence === "object"
        ? (obj.evidence as Record<string, unknown>)
        : undefined,
    fallback:
      typeof obj.fallback === "string"
        ? obj.fallback
        : obj.fallback === null
          ? null
          : undefined,
  };
}

type RouterEvidence = {
  candidate_mode?: string;
  final_mode?: string;
  fallback?: string | null;
  ddl?: Record<string, unknown>;
  fts?: Record<string, unknown>;
  raw: Record<string, unknown>;
};

function extractRouterEvidence(events: ChainEvent[]): RouterEvidence | null {
  const last = [...events]
    .filter((e) => e.type === "router.evidence")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (!last) return null;
  const p = last.payload ?? {};
  if (!p || typeof p !== "object") return null;
  const obj = p as Record<string, unknown>;
  return {
    candidate_mode: typeof obj.candidate_mode === "string" ? obj.candidate_mode : undefined,
    final_mode: typeof obj.final_mode === "string" ? obj.final_mode : undefined,
    fallback:
      typeof obj.fallback === "string"
        ? obj.fallback
        : obj.fallback === null
          ? null
          : undefined,
    ddl: obj.ddl && typeof obj.ddl === "object" ? (obj.ddl as Record<string, unknown>) : undefined,
    fts: obj.fts && typeof obj.fts === "object" ? (obj.fts as Record<string, unknown>) : undefined,
    raw: obj,
  };
}

type AgentIntentObsRow = {
  tool: string;
  mode: string;
  confidence: string;
  cache: string;
  cache_key_hash: string;
  latency_ms: string;
};

function extractAgentIntentObs(events: ChainEvent[]): AgentIntentObsRow | null {
  const last = [...events]
    .filter((e) => e.type === "agent.intent")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (!last) return null;
  const p = last.payload;
  if (!p || typeof p !== "object") return null;
  const obj = p as Record<string, unknown>;
  const tool = typeof obj.tool === "string" && obj.tool.trim() ? obj.tool : "—";
  const mode = typeof obj.mode === "string" && obj.mode.trim() ? obj.mode : "—";
  const conf =
    typeof obj.confidence === "number" && Number.isFinite(obj.confidence)
      ? String(obj.confidence)
      : "—";
  const cacheRaw = obj.cache;
  const cache = cacheRaw === "hit" || cacheRaw === "miss" ? cacheRaw : "—";
  const cache_key_hash =
    typeof obj.cache_key_hash === "string" && obj.cache_key_hash.trim() ? obj.cache_key_hash : "—";
  const lat = obj.latency_ms;
  const latency_ms =
    typeof lat === "number" && Number.isFinite(lat) ? `${Math.round(lat)} ms` : "—";
  return { tool, mode, confidence: conf, cache, cache_key_hash, latency_ms };
}

function modeTone(mode: string): string {
  const m = mode.trim();
  if (m === "text2sql") return "border-indigo-500/20 bg-indigo-500/10 text-indigo-800";
  if (m === "rag") return "border-teal-500/20 bg-teal-500/10 text-teal-800";
  if (m === "no_data") return "border-slate-500/20 bg-slate-500/10 text-slate-700";
  if (m.startsWith("tool:")) return "border-amber-500/20 bg-amber-500/10 text-amber-800";
  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-800";
}

export function UnifiedChatPageClient() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const tokenInputRef = useRef<HTMLInputElement | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>("");
  /** vNext §5.4：坏帧计数，默认不对用户展示 */
  const parseErrorCountRef = useRef(0);

  const [prefer, setPrefer] = useState<PreferMode>("auto");
  const [debugRouter, setDebugRouter] = useState(false);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    setToken(readToken());
  }, []);

  useEffect(() => {
    if (mounted && !token) tokenInputRef.current?.focus();
  }, [mounted, token]);

  const locked = !token.trim();

  const headers: Record<string, string> = useMemo(() => {
    const t = token.trim();
    return t ? { Authorization: `Bearer ${t}` } : ({} as Record<string, string>);
  }, [token]);

  const { sessionId, resetSession } = useSessionId("unified-chat");
  const [activeRequestId, setActiveRequestId] = useState<string>("");
  const [lastDone, setLastDone] = useState<{
    ok: boolean;
    mode: string;
    run_id: string;
    session_id: string;
    request_id: string;
  } | null>(null);
  /** Timeline 卡片：标题栏「全部展开/收起」受控 */
  const [timelineBatchNonce, setTimelineBatchNonce] = useState(0);
  const [timelineBatchOpen, setTimelineBatchOpen] = useState(false);

  const debugEnabled = useMemo(() => {
    if (typeof window === "undefined") return false;
    const sp = new URLSearchParams(window.location.search);
    return sp.get("debug") === "1" || sp.get("debug") === "true";
  }, []);

  // 关闭 Debug 时清理本轮 debug 节点，避免误读旧数据
  useEffect(() => {
    if (debugRouter) return;
    setEvents((prev) =>
      prev.filter((e) => e.type !== "router.evidence.details" && e.type !== "agent.intent"),
    );
  }, [debugRouter]);

  const messages = useMemo(() => extractMessagesFromEvents(events), [events]);
  const routerDecision = useMemo(() => extractRouterDecision(events), [events]);
  const routerEvidence = useMemo(() => extractRouterEvidence(events), [events]);
  const agentIntentObs = useMemo(() => extractAgentIntentObs(events), [events]);
  const queryTextTrace = useMemo(() => extractUserQueryText(events), [events]);
  const execSections = useMemo(() => buildExecutionTraceSections(events), [events]);
  const timelineEvents = useMemo(() => {
    if (debugRouter) return events;
    return events.filter(
      (e) => e.type !== "router.evidence.details" && e.type !== "agent.intent",
    );
  }, [debugRouter, events]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 p-4 text-sm text-slate-600">
        正在加载…
      </div>
    );
  }

  const send = async (q: string) => {
    lastQueryRef.current = q;
    // 取消上一次 SSE
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;

    setLoading(true);
    setErrorText(null);
    setFinalAnswer("");
    parseErrorCountRef.current = 0;
    setActiveRequestId("");
    setLastDone(null);

    // 先把 user.message 放进 timeline，保证左栏/中栏立即有反馈
    const runId = crypto.randomUUID();
    const userEvent: ChainEvent = {
      type: "user.message",
      ts: Date.now(),
      run_id: runId,
      step_id: "user",
      payload: { text: q },
    };
    setEvents([userEvent]);
    setTimelineBatchOpen(false);
    setTimelineBatchNonce((n) => n + 1);

    try {
      const ac = new AbortController();
      streamAbortRef.current = ac;

      const res = await fetch("/api/py/unified/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [SSE_CONTRACT_HEADER]: SSE_CONTRACT_V2,
          ...headers,
        },
        credentials: "include",
        signal: ac.signal,
        body: JSON.stringify({
          session_id: sessionId,
          query: q,
          prefer,
          debug_router: debugRouter,
        }),
      });
      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(pickErrorMessage(raw, res.status, res.statusText));
      }
      if (!res.body) throw new Error("SSE 响应无 body（ReadableStream 不可用）");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // 服务端可能在 done 里返回 run_id；先用本地 runId，后续如拿到再覆盖
      let currentRunId = runId;
      let donePayload: unknown = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // 按 SSE block 分割（\n\n），保留最后一个不完整块到 buffer
        const idx = buffer.lastIndexOf("\n\n");
        if (idx < 0) continue;
        const ready = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        const blocks = parseSseBlocks(ready);
        for (const b of blocks) {
          const j = safeJson(b.data);
          if (b.event === "chain") {
            if (j == null) {
              parseErrorCountRef.current += 1;
              console.debug("[UnifiedChat SSE] chain JSON 跳过", parseErrorCountRef.current);
              continue;
            }
            const ev = chainEventFromSse({
              runId: currentRunId,
              raw: j,
              fallbackStepId: "chain",
            });
            if (!ev) {
              parseErrorCountRef.current += 1;
              console.debug("[UnifiedChat SSE] chain 帧跳过", parseErrorCountRef.current);
              continue;
            }
            setEvents((prev) => [...prev, ev]);
            continue;
          }
          if (b.event === "token") {
            // vNext：Unified 增量路径不以顶层 token 作为子步 LLM；最终答案见 assistant.message
            continue;
          }
          if (b.event === "done") {
            donePayload = j;
            if (j && typeof j === "object") {
              const obj = j as Record<string, unknown>;
              const rid = typeof obj.run_id === "string" ? obj.run_id : "";
              if (rid.trim()) currentRunId = rid.trim();

              // request_id：跨端链路追踪 id（v1：与 run_id 等价；仅记录/展示，不参与主流程判断）
              const requestId = typeof obj.request_id === "string" ? obj.request_id : "";
              if (requestId.trim()) setActiveRequestId(requestId.trim());

              const ok = typeof obj.ok === "boolean" ? obj.ok : false;
              const mode = typeof obj.mode === "string" ? obj.mode : "";
              const session = typeof obj.session_id === "string" ? obj.session_id : "";
              setLastDone({
                ok,
                mode,
                run_id: rid.trim(),
                session_id: session,
                request_id: requestId.trim(),
              });

              if (debugEnabled) {
                console.debug("[UnifiedChat SSE done]", {
                  request_id: requestId.trim(),
                  run_id: rid.trim(),
                  session_id: session,
                  ok,
                  mode,
                });
              }

              // P7_NEG_TEST（production 用例3）：已完成验证并移除越界读取
            }
            continue;
          }
        }
      }

      // done 后收尾：从当前 events 里补一次最终答案（避免闭包拿不到最新 events）
      setEvents((prev) => {
        const inferred = extractFinalAnswer({ answer: undefined, events: prev });
        if (inferred.trim()) setFinalAnswer((fa) => (fa.trim() ? fa : inferred));
        // donePayload 仅用于调试/未来扩展，这里不落 event，避免污染时间线
        void donePayload;
        return prev;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorText(msg);
    } finally {
      setLoading(false);
      streamAbortRef.current = null;
    }
  };

  const executionLinkSection = (
    <section className="flex min-h-[72vh] min-w-0 flex-col rounded-2xl border border-[color:var(--color-border)] bg-white/40">
      <div className="border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="font-serif text-sm text-[#2c2c2c]">执行链路</div>
        <div className="mt-0.5 text-[11px] text-slate-500">
          按 SSE 顺序展示 Agent 子步与决策（每段 <span className="font-mono">agent.llm.*</span> 单独成块，不混拼）；明细见左侧 Timeline
        </div>
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
                  </div>
                ) : null}
                {s.kind === "think" ? (
                  <div className="space-y-1 text-sm">
                    <div className="font-mono text-[11px] text-slate-600">agent.think</div>
                    <div className="whitespace-pre-wrap rounded border border-slate-200/80 bg-slate-50/80 px-2 py-1.5 text-slate-800">
                      {s.thought || "—"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      tool <span className="font-mono">{s.tool || "—"}</span> · mode{" "}
                      <span className="font-mono">{s.mode || "—"}</span>
                    </div>
                  </div>
                ) : null}
                {s.kind === "tool_start" ? (
                  <div className="font-mono text-[12px] text-amber-900">
                    tool.call.start · {s.tool}
                  </div>
                ) : null}
                {s.kind === "tool_end" ? (
                  <div className="space-y-1">
                    <div className="font-mono text-[12px] text-amber-900">tool.call.end · {s.tool}</div>
                    {s.snippet.trim() ? (
                      <div className="line-clamp-4 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-slate-600">
                        {s.snippet}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {s.kind === "truncated" ? (
                  <div className="font-mono text-[11px] text-rose-800">
                    agent.llm.truncated · dropped={s.dropped} · {s.reason}
                  </div>
                ) : null}
                {s.kind === "error_line" ? (
                  <div className="font-mono text-[11px] text-rose-800">
                    error [{s.stage}] {s.message}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  const timelineSection = (
    <section className="flex min-h-[72vh] min-w-0 flex-col rounded-2xl border border-[color:var(--color-border)] bg-white/40">
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-serif text-sm text-[#2c2c2c]">Timeline</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            vNext：SSE 到达序（含 agent.llm.*）；展开查看详情
          </div>
        </div>
        {timelineEvents.length > 0 ? (
          <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
            <button
              type="button"
              className={chainTimelineExpandBtnClass}
              onClick={() => {
                setTimelineBatchOpen(true);
                setTimelineBatchNonce((n) => n + 1);
              }}
            >
              全部展开
            </button>
            <button
              type="button"
              className={chainTimelineExpandBtnClass}
              onClick={() => {
                setTimelineBatchOpen(false);
                setTimelineBatchNonce((n) => n + 1);
              }}
            >
              全部收起
            </button>
          </div>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
        <ChainTimeline
          events={timelineEvents}
          sortByTs={false}
          showExpandToolbar={false}
          batchExpandNonce={timelineBatchNonce}
          batchExpandOpen={timelineBatchOpen}
        />
      </div>
    </section>
  );

  return (
    <div className="space-y-4">
      {locked ? (
        <section className="mx-auto max-w-lg rounded-2xl border border-[color:var(--color-border)] bg-white/40 p-4">
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-slate-700">此功能仅博主可用，请输入密钥解锁。</p>
            <label className="block text-[11px] text-slate-500">
              Token（NEXT_PUBLIC_ADMIN_SECRET）
              <input
                ref={tokenInputRef}
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                placeholder="输入后本地存储"
                autoComplete="off"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                const t = tokenInput.trim();
                writeToken(t);
                setToken(t);
              }}
              className="w-full rounded-xl bg-[#2c2c2c] px-3 py-2 text-sm text-[#f9f9f7] hover:opacity-90"
            >
              解锁
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-3">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-0 text-[11px] text-slate-500">
                session_id: <span className="font-mono text-slate-700">{sessionId}</span>
              </div>
              <label className="block text-[11px] text-slate-500">
                prefer
                <select
                  value={prefer}
                  onChange={(e) => setPrefer(e.target.value as PreferMode)}
                  className="mt-1 min-w-[140px] rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                >
                  <option value="auto">auto</option>
                  <option value="rag">rag</option>
                  <option value="text2sql">text2sql</option>
                </select>
              </label>
            </div>
          </section>

          {/* Timeline（左）| 执行链路 + Timeline 输出（右）：固定左右双栏 */}
          <div className="grid min-h-0 grid-cols-2 gap-4 [&>section]:min-w-0">
            {timelineSection}
            {executionLinkSection}
          </div>

          <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
            <div className="border-b border-[color:var(--color-border)] px-4 py-3">
              <div className="font-serif text-sm text-[#2c2c2c]">消息</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                最终答案以 <span className="font-mono">assistant.message</span> 为准（vNext §8.4）
              </div>
            </div>
            <div className="max-h-[50vh] overflow-auto px-4 py-4">
              {finalAnswer.trim() ? (
                <div className="mb-4 rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/90 px-3 py-2">
                  <div className="text-[10px] text-slate-400">最终答案</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{finalAnswer}</div>
                </div>
              ) : null}
              {messages.length === 0 ? (
                <p className="text-[12px] leading-relaxed text-slate-500">
                  发送一次问题后，这里会显示从 events 提取的 user/assistant 消息。
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/80 px-3 py-2"
                    >
                      <div className="text-[10px] text-slate-400">{m.role}</div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{m.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-4">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-slate-700">Router Debug</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    开启后请求会透传 <span className="font-mono">debug_router: true</span>，并展示{" "}
                    <span className="font-mono">router.evidence.details</span> 与 Intent 缓存可观测字段（
                    <span className="font-mono">agent.intent</span>）
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const next = !debugRouter;
                    setDebugRouter(next);
                    if (loading && lastQueryRef.current.trim()) {
                      streamAbortRef.current?.abort();
                      streamAbortRef.current = null;
                      await send(lastQueryRef.current.trim());
                    }
                  }}
                  className={[
                    "shrink-0 rounded-full border px-3 py-1 text-[11px]",
                    debugRouter
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800"
                      : "border-[color:var(--color-border)] bg-white/60 text-slate-700",
                  ].join(" ")}
                  title={debugRouter ? "点击关闭（会清理当前会话的 debug 节点）" : "点击开启（必要时会重连 SSE）"}
                >
                  {debugRouter ? "ON" : "OFF"}
                </button>
              </div>
            </div>

              <details className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-3">
                <summary className="cursor-pointer select-none text-[12px] text-slate-700">
                  路由决策（intent router）
                </summary>
                <div className="mt-3 space-y-2">
                  {routerDecision?.final_mode ? (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
                      <span className="text-slate-500">final_mode</span>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 font-mono",
                          modeTone(routerDecision.final_mode),
                        ].join(" ")}
                      >
                        {routerDecision.final_mode}
                      </span>
                      {routerDecision.candidate_mode ? (
                        <>
                          <span className="text-slate-500">candidate</span>
                          <span className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 font-mono text-slate-700">
                            {routerDecision.candidate_mode}
                          </span>
                        </>
                      ) : null}
                      {routerDecision.prefer ? (
                        <>
                          <span className="text-slate-500">prefer</span>
                          <span className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 font-mono text-slate-700">
                            {routerDecision.prefer}
                          </span>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      （本轮 events 未发现 <span className="font-mono">router.decision</span>）
                    </div>
                  )}

                  {routerDecision?.rule_hits?.length ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500">rule_hits</div>
                      <div className="flex flex-wrap gap-2">
                        {routerDecision.rule_hits.map((h) => (
                          <span
                            key={h}
                            className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 text-[11px] text-slate-700"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {routerDecision?.evidence ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500">evidence</div>
                      <pre className="max-h-[22vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                        {safeStringify(routerDecision.evidence)}
                      </pre>
                    </div>
                  ) : null}

                  {typeof routerDecision?.fallback === "string" && routerDecision.fallback.trim() ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500">fallback</div>
                      <div className="whitespace-pre-wrap text-[11px] text-slate-700">
                        {routerDecision.fallback}
                      </div>
                    </div>
                  ) : null}

                  {routerEvidence?.raw ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500">
                        router.evidence（raw）
                      </div>
                      <pre className="max-h-[22vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                        {safeStringify(routerEvidence.raw)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      （本轮 events 未发现 <span className="font-mono">router.evidence</span>）
                    </div>
                  )}

                  {debugRouter ? (
                    <div className="mt-4 border-t border-[color:var(--color-border)] pt-3">
                      <div className="text-[11px] font-medium text-slate-600">Intent（V2）</div>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                        同一 session 多轮对话时，<span className="font-mono">cache=miss</span>{" "}
                        很常见：Intent 缓存键包含历史摘要，历史变化会导致复合键变化，不代表缓存失效。
                      </p>
                      {agentIntentObs ? (
                        <dl className="mt-2 grid gap-1.5 text-[11px] text-slate-700">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <dt className="text-slate-500">tool</dt>
                            <dd className="font-mono">{agentIntentObs.tool}</dd>
                          </div>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <dt className="text-slate-500">mode</dt>
                            <dd className="font-mono">{agentIntentObs.mode}</dd>
                          </div>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <dt className="text-slate-500">confidence</dt>
                            <dd className="font-mono">{agentIntentObs.confidence}</dd>
                          </div>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <dt className="text-slate-500">cache</dt>
                            <dd className="font-mono">{agentIntentObs.cache}</dd>
                          </div>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <dt className="text-slate-500">cache_key_hash</dt>
                            <dd className="break-all font-mono">{agentIntentObs.cache_key_hash}</dd>
                          </div>
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <dt className="text-slate-500">latency_ms</dt>
                            <dd className="font-mono">{agentIntentObs.latency_ms}</dd>
                          </div>
                        </dl>
                      ) : (
                        <div className="mt-2 text-[11px] text-slate-500">
                          （本轮 events 未发现 <span className="font-mono">agent.intent</span>，或 Agent 路径未启用）
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </details>

              {debugEnabled ? (
                <details className="rounded-2xl border border-[color:var(--color-border)] bg-white/60 p-3">
                  <summary className="cursor-pointer select-none text-[12px] text-slate-700">
                    Debug（SSE done）
                  </summary>
                  <div className="mt-3 space-y-2 text-[11px] text-slate-700">
                    <div>
                      request_id:{" "}
                      <span className="font-mono">{activeRequestId || "（等待 done）"}</span>
                    </div>
                    {lastDone ? (
                      <pre className="max-h-[18vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-2 font-mono text-[10px] text-slate-700">
                        {safeStringify(lastDone)}
                      </pre>
                    ) : null}
                  </div>
                </details>
              ) : null}

              <div className="text-[11px] text-slate-500">推荐问法</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "统计 agent_info 表里有多少条数据",
                  "这篇日志主要讲了什么？请给出引用来源",
                  "总结一下 RRF 融合策略的核心思想",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraft(s)}
                    className="rounded-full border border-[color:var(--color-border)] bg-[#f9f9f7] px-3 py-1.5 text-[11px] text-slate-700 hover:bg-white/70"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {errorText ? (
                <p className="text-[12px] leading-relaxed text-red-600/90">
                  {errorText}
                </p>
              ) : null}

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                placeholder="输入问题…"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    streamAbortRef.current?.abort();
                    streamAbortRef.current = null;
                    resetSession();
                    setEvents([]);
                    setTimelineBatchOpen(false);
                    setTimelineBatchNonce((n) => n + 1);
                    setErrorText(null);
                    setFinalAnswer("");
                  }}
                  className="rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2 text-sm text-slate-700"
                >
                  新会话
                </button>
                <button
                  type="button"
                  onClick={() => void send(draft.trim())}
                  disabled={loading || !draft.trim()}
                  className="rounded-xl bg-[#2c2c2c] px-4 py-2 text-sm text-[#f9f9f7] disabled:opacity-40"
                >
                  {loading ? "…" : "发送"}
                </button>
              </div>
          </section>
        </>
      )}
    </div>
  );
}
