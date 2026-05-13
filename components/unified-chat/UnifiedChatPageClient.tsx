"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { ChatHistoryRow } from "@/lib/chat/chatApi";
import { fetchChatHistory } from "@/lib/chat/chatApi";
import {
  fetchWithAuthRecovery,
  readChatbiToken,
  requestChatbiAccessVerify,
  writeChatbiToken,
} from "@/lib/chatbi-client";
import { useSessionId } from "@/lib/hooks/useSessionId";
import { type ChainEvent, UNIFIED_SSE_CHAIN_TYPE_WHITELIST } from "@/components/chain-chat/types";
import { ChainTimeline, chainTimelineExpandBtnClass } from "@/components/chain-chat/ChainTimeline";
import {
  extractText2sqlPhasesMsFromToolOutput,
  isValidText2SqlPhaseEndPayload,
  isValidText2SqlPhaseStartPayload,
} from "@/lib/unified-chat/text2sqlPhaseSse";

/** Unified Chat 增量 SSE 契约版本（须与 BFF / Python 一致） */
const SSE_CONTRACT_HEADER = "X-ChatBI-Sse-Contract";
const SSE_CONTRACT_V2 = "2";

type PreferMode = "auto" | "rag" | "text2sql";

type ChatRow = { id: string; role: "user" | "assistant"; text: string };

/** 跨轮会话摘要（进入页面时从 GET /api/py/chat/history 恢复，与 session_id 对齐） */
type TranscriptTurn = { id: string; user: string; assistant: string };

/** 将历史接口的扁平 messages（user/assistant 交替）转为 transcript 轮次 */
function mapHistoryRowsToTranscript(messages: ChatHistoryRow[] | undefined): TranscriptTurn[] {
  if (!messages?.length) return [];
  const out: TranscriptTurn[] = [];
  let pendingUser = "";
  for (const m of messages) {
    if (m.role === "user") {
      pendingUser = typeof m.content === "string" ? m.content.trim() : "";
    } else if (m.role === "assistant") {
      const a = typeof m.content === "string" ? m.content.trim() : "";
      out.push({
        id: `hist-${out.length}`,
        user: pendingUser,
        assistant: a,
      });
      pendingUser = "";
    }
  }
  if (pendingUser) {
    out.push({
      id: `hist-pending-${out.length}`,
      user: pendingUser,
      assistant: "",
    });
  }
  return out;
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

/** 复制纯文本到剪贴板（含 execCommand 兜底） */
async function copyPlainToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = text;
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
  | { kind: "clarify"; message: string; prompt_for_user: string }
  | {
      kind: "plan_preview";
      plan_id: string;
      tool: string;
      sql_draft: string;
      warningsLines: string[];
      expires_in_sec: number;
    }
  | { kind: "tool_start"; tool: string }
  | {
      kind: "tool_end";
      tool: string;
      snippet: string;
      toolError: string | null;
      latencyMs: number | null;
      /** 终态分段 ms：仅来自 `output.text2sql_phases_ms`，与 phase.end 的 latency 不并排两套 */
      text2sqlPhasesMs: Record<string, number> | null;
    }
  | { kind: "text2sql_phase_start"; phaseId: string; phaseKind: "llm" | "db" | "io" }
  | { kind: "text2sql_phase_end"; phaseId: string; latencyMs: number }
  | { kind: "truncated"; reason: string; dropped: number }
  | { kind: "error_line"; stage: string; message: string; persistHint?: string };

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
    if (e.type === "agent.debug.llm_prompts") {
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
    if (e.type === "agent.clarify") {
      const p = e.payload ?? {};
      const msg = typeof p.message === "string" ? p.message : "";
      const prompt = typeof p.prompt_for_user === "string" ? p.prompt_for_user : "";
      out.push({ kind: "clarify", message: msg, prompt_for_user: prompt });
      i += 1;
      continue;
    }
    if (e.type === "agent.plan.preview") {
      const p = e.payload ?? {};
      if (typeof p === "object" && p !== null && !Array.isArray(p) && isValidAgentPlanPreviewPayload(p as Record<string, unknown>)) {
        const rec = p as Record<string, unknown>;
        const warns = Array.isArray(rec.warnings) ? rec.warnings : [];
        const warningsLines = warns.map((w) => (typeof w === "string" ? w : safeStringify(w)));
        const exp = rec.expires_in_sec;
        const expires_in_sec = typeof exp === "number" && Number.isFinite(exp) ? Math.max(0, exp) : 0;
        out.push({
          kind: "plan_preview",
          plan_id: typeof rec.plan_id === "string" ? rec.plan_id : "",
          tool: typeof rec.tool === "string" ? rec.tool : "",
          sql_draft: typeof rec.sql_draft === "string" ? rec.sql_draft : "",
          warningsLines,
          expires_in_sec,
        });
      }
      i += 1;
      continue;
    }
    if (e.type === "tool.call.start") {
      const tool = typeof e.payload.tool === "string" ? e.payload.tool : "—";
      out.push({ kind: "tool_start", tool });
      i += 1;
      continue;
    }
    if (e.type === "text2sql.phase.start") {
      const pl = e.payload ?? {};
      if (typeof pl === "object" && pl !== null && !Array.isArray(pl)) {
        const rec = pl as Record<string, unknown>;
        const pid = typeof rec.phase_id === "string" ? rec.phase_id.trim() : "";
        const pk = rec.phase_kind;
        if (pid && (pk === "llm" || pk === "db" || pk === "io")) {
          out.push({ kind: "text2sql_phase_start", phaseId: pid, phaseKind: pk });
        }
      }
      i += 1;
      continue;
    }
    if (e.type === "text2sql.phase.end") {
      const pl = e.payload ?? {};
      if (typeof pl === "object" && pl !== null && !Array.isArray(pl)) {
        const rec = pl as Record<string, unknown>;
        const pid = typeof rec.phase_id === "string" ? rec.phase_id.trim() : "";
        const lat = rec.latency_ms;
        if (pid && typeof lat === "number" && Number.isFinite(lat)) {
          out.push({ kind: "text2sql_phase_end", phaseId: pid, latencyMs: Math.round(lat) });
        }
      }
      i += 1;
      continue;
    }
    if (e.type === "tool.call.end") {
      const pl = e.payload ?? {};
      const snippet = extractTextFromPayload(pl).slice(0, 400);
      const toolErrRaw = pl.error;
      const toolError =
        typeof toolErrRaw === "string" && toolErrRaw.trim() ? toolErrRaw.trim() : null;
      const latRaw = pl.latency_ms;
      const latencyMs =
        typeof latRaw === "number" && Number.isFinite(latRaw) ? Math.round(latRaw) : null;
      const text2sqlPhasesMs = extractText2sqlPhasesMsFromToolOutput(pl.output);
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
      out.push({ kind: "tool_end", tool: toolName, snippet, toolError, latencyMs, text2sqlPhasesMs });
      i += 1;
      continue;
    }
    if (e.type === "error") {
      const stage = typeof e.payload.stage === "string" ? e.payload.stage : "error";
      const message = typeof e.payload.message === "string" ? e.payload.message : "";
      let persistHint: string | undefined;
      const pr = (e.payload as Record<string, unknown>).persist;
      if (pr && typeof pr === "object" && !Array.isArray(pr)) {
        const o = pr as Record<string, unknown>;
        const compact = {
          ok: o.ok,
          error: o.error,
          path: o.path,
          timeout_s: o.timeout_s,
          skipped: o.skipped,
        };
        persistHint = safeStringify(compact);
      }
      out.push({ kind: "error_line", stage, message, persistHint });
      i += 1;
      continue;
    }
    i += 1;
  }
  return out;
}

/** 与右栏「执行链路」展示一致的纯文本，供复制 */
function buildExecutionTraceCopyText(query: string, sections: ExecSection[]): string {
  const lines: string[] = ["=== 执行链路 ===", ""];
  const q = query.trim();
  if (q) {
    lines.push("Query:", q, "");
  }
  if (sections.length === 0) {
    lines.push("（暂无步骤）");
    return lines.join("\n");
  }
  for (let idx = 0; idx < sections.length; idx += 1) {
    const s = sections[idx];
    if (!s) continue;
    lines.push(`--- step-${idx + 1} ---`);
    if (s.kind === "llm_block") {
      lines.push(
        `agent.llm.start · ${s.phase}（${phaseHintCn(s.phase)}）`,
        s.body.trim() ? s.body : "（无 delta 正文）",
        `agent.llm.end · ${s.phase} · ${s.ok ? "ok" : "fail"}`,
      );
    } else if (s.kind === "router") {
      lines.push(`router.decision → ${s.finalMode}`);
    } else if (s.kind === "intent") {
      lines.push(`agent.intent · ${s.tool} · mode ${s.mode}`);
    } else if (s.kind === "think") {
      lines.push("agent.think", s.thought || "—", `tool ${s.tool || "—"} · mode ${s.mode || "—"}`);
    } else if (s.kind === "clarify") {
      lines.push("agent.clarify", s.message || "—", s.prompt_for_user || "—");
    } else if (s.kind === "plan_preview") {
      lines.push(
        `agent.plan.preview · plan_id=${s.plan_id} · tool=${s.tool}`,
        `expires_in_sec=${s.expires_in_sec}`,
        s.sql_draft.trim() ? `sql_draft:\n${s.sql_draft}` : "sql_draft: —",
        s.warningsLines.length ? `warnings:\n${s.warningsLines.join("\n")}` : "warnings: —",
      );
    } else if (s.kind === "tool_start") {
      lines.push(`tool.call.start · ${s.tool}`);
    } else if (s.kind === "tool_end") {
      lines.push(`tool.call.end · ${s.tool}`);
      if (s.latencyMs != null) lines.push(`${s.latencyMs} ms`);
      lines.push(s.toolError ? `工具 error: ${s.toolError}` : "（无 error 字段）");
      if (s.text2sqlPhasesMs && Object.keys(s.text2sqlPhasesMs).length) {
        lines.push("Text2SQL 分段耗时（终态 text2sql_phases_ms）:", safeStringify(s.text2sqlPhasesMs));
      }
      lines.push(s.snippet.trim() ? `output 摘要:\n${s.snippet}` : "（无 output 摘要）");
    } else if (s.kind === "text2sql_phase_start") {
      lines.push(`text2sql.phase.start · ${s.phaseId} · kind=${s.phaseKind}`);
    } else if (s.kind === "text2sql_phase_end") {
      lines.push(`text2sql.phase.end · ${s.phaseId} · ${s.latencyMs} ms`);
    } else if (s.kind === "truncated") {
      lines.push(`agent.llm.truncated · dropped=${s.dropped} · ${s.reason}`);
    } else if (s.kind === "error_line") {
      lines.push(`error · ${s.stage}`, s.message);
      if (s.persistHint) lines.push(`persist:\n${s.persistHint}`);
    }
    lines.push("");
  }
  return `${lines.join("\n").trimEnd()}\n`;
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

/** manifest `agent.clarify` 最小键校验；缺字段则整帧丢弃（策略 B） */
function isValidAgentClarifyPayload(p: Record<string, unknown>): boolean {
  const sn = p.step_number;
  if (typeof sn !== "number" || !Number.isFinite(sn)) return false;
  if (typeof p.message !== "string") return false;
  if (typeof p.prompt_for_user !== "string") return false;
  return true;
}

/** manifest `agent.plan.preview` 最小键校验；缺字段则整帧丢弃（策略 B） */
function isValidAgentPlanPreviewPayload(p: Record<string, unknown>): boolean {
  if (typeof p.plan_id !== "string" || !p.plan_id.trim()) return false;
  if (typeof p.tool !== "string") return false;
  if (typeof p.sql_draft !== "string") return false;
  if (!Array.isArray(p.warnings)) return false;
  if (typeof p.plan_execution_token !== "string" || !p.plan_execution_token.trim()) return false;
  const exp = p.expires_in_sec;
  if (typeof exp !== "number" || !Number.isFinite(exp) || exp < 0) return false;
  return true;
}

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

  if (!UNIFIED_SSE_CHAIN_TYPE_WHITELIST.has(type)) {
    console.debug("[UnifiedChat SSE] 未知 chain.type，策略 B 跳过", type);
    return null;
  }

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

  if (type === "text2sql.phase.start" && !isValidText2SqlPhaseStartPayload(payload)) {
    return null;
  }
  if (type === "text2sql.phase.end" && !isValidText2SqlPhaseEndPayload(payload)) {
    return null;
  }
  if (type === "agent.clarify" && !isValidAgentClarifyPayload(payload)) {
    return null;
  }
  if (type === "agent.plan.preview" && !isValidAgentPlanPreviewPayload(payload)) {
    return null;
  }

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
  /** 假登录：仅 ChatBI DB 明文；校验在「解锁」按钮触发 */
  const [credentialInput, setCredentialInput] = useState("");
  const [chatbiToken, setChatbiToken] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const tokenInputRef = useRef<HTMLInputElement | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>("");
  /** 本轮 SSE 累积事件（与 React state 同步，供流结束后 extractFinalAnswer / transcript 钉死 D2） */
  const roundEventsRef = useRef<ChainEvent[]>([]);
  /** vNext §5.4：坏帧计数，默认不对用户展示 */
  const parseErrorCountRef = useRef(0);

  const [prefer, setPrefer] = useState<PreferMode>("auto");
  const [debugRouter, setDebugRouter] = useState(false);
  /** 与后端 `debug_llm_prompts` / `CHATBI_V2_DEBUG_LLM_PROMPTS` 对齐；仅建议在 ?debug=1 下开启 */
  const [debugLlmPrompts, setDebugLlmPrompts] = useState(false);
  const [draft, setDraft] = useState("");
  /** 低置信预览：与首轮 user 问句、session 绑定的放行令牌（见 manifest `agent.plan.preview`） */
  type PendingPlanConfirmState = {
    token: string;
    boundQuery: string;
    sessionId: string;
    expiresInSec: number;
    receivedAtMs: number;
    sqlDraft: string;
    warnings: unknown[];
    planId: string;
    tool: string;
  };
  const [pendingPlanConfirm, setPendingPlanConfirm] = useState<PendingPlanConfirmState | null>(null);
  /** TTL 倒计时：每秒 tick，以后端校验为准 */
  const [ttlTick, setTtlTick] = useState(0);
  const dismissedPlanTokenRef = useRef<string | null>(null);
  const pendingPlanConfirmRef = useRef<PendingPlanConfirmState | null>(null);

  useEffect(() => {
    pendingPlanConfirmRef.current = pendingPlanConfirm;
  }, [pendingPlanConfirm]);

  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);

  const locked = !chatbiToken.trim();

  useEffect(() => {
    setMounted(true);
    setChatbiToken(readChatbiToken());
  }, []);

  useEffect(() => {
    if (mounted && locked) tokenInputRef.current?.focus();
  }, [mounted, locked]);

  const headers: Record<string, string> = useMemo(() => {
    const c = chatbiToken.replace(/^bearer\s+/i, "").trim();
    if (!c) return {} as Record<string, string>;
    // 与 Python GET verify / Unified 一致：Bearer 明文，经 BFF 原样转上游（或 rewrite 直连 Python）
    return { Authorization: `Bearer ${c}` };
  }, [chatbiToken]);

  const { sessionId, resetSession } = useSessionId("unified-chat");
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const [historyReady, setHistoryReady] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [activeRequestId, setActiveRequestId] = useState<string>("");
  const [lastDone, setLastDone] = useState<{
    ok: boolean;
    mode: string;
    run_id: string;
    session_id: string;
    request_id: string;
    /** 后端 V2 落库 `rag_conversation_logs` 结果（`ok: false` 时多轮历史可能缺本轮） */
    persist?: Record<string, unknown>;
  } | null>(null);
  /** Timeline 卡片：标题栏「全部展开/收起」受控 */
  const [timelineBatchNonce, setTimelineBatchNonce] = useState(0);
  const [timelineBatchOpen, setTimelineBatchOpen] = useState(false);

  const [debugFromUrl, setDebugFromUrl] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const read = () => {
      const sp = new URLSearchParams(window.location.search);
      setDebugFromUrl(sp.get("debug") === "1" || sp.get("debug") === "true");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  /** 与地址栏 `?debug=1` 同步，便于本页一键开关调试区（不整段手改 URL） */
  const syncDebugUrlParam = useCallback((on: boolean) => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (on) {
      sp.set("debug", "1");
    } else {
      sp.delete("debug");
    }
    const qs = sp.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", next);
    setDebugFromUrl(on);
  }, []);

  const debugEnabled = debugFromUrl;

  useEffect(() => {
    if (debugEnabled) return;
    setDebugLlmPrompts(false);
  }, [debugEnabled]);

  // 与 ChatPanel 一致：解锁后按 session_id 拉 rag_conversation_logs，刷新/重进页面可恢复摘要
  useEffect(() => {
    if (!mounted || locked) {
      return;
    }

    const ac = new AbortController();
    const sidAtStart = sessionId;
    setHistoryReady(false);
    setHistoryError(null);

    void (async () => {
      try {
        const data = await fetchChatHistory({
          sessionId: sidAtStart,
          headers,
          limit: 100,
          signal: ac.signal,
        });
        if (ac.signal.aborted || sessionIdRef.current !== sidAtStart) return;
        setTranscript(mapHistoryRowsToTranscript(data.messages));
      } catch (e) {
        if (ac.signal.aborted) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (sessionIdRef.current !== sidAtStart) return;
        setHistoryError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!ac.signal.aborted && sessionIdRef.current === sidAtStart) {
          setHistoryReady(true);
        }
      }
    })();

    return () => ac.abort();
  }, [mounted, locked, sessionId, headers]);

  // 关闭 Debug 时清理本轮 debug 节点，避免误读旧数据
  useEffect(() => {
    if (debugRouter) return;
    setEvents((prev) =>
      prev.filter((e) => e.type !== "router.evidence.details" && e.type !== "agent.intent"),
    );
  }, [debugRouter]);

  useEffect(() => {
    if (debugLlmPrompts) return;
    setEvents((prev) => prev.filter((e) => e.type !== "agent.debug.llm_prompts"));
  }, [debugLlmPrompts]);

  const messages = useMemo(() => extractMessagesFromEvents(events), [events]);
  const routerDecision = useMemo(() => extractRouterDecision(events), [events]);
  const routerEvidence = useMemo(() => extractRouterEvidence(events), [events]);
  const agentIntentObs = useMemo(() => extractAgentIntentObs(events), [events]);
  const queryTextTrace = useMemo(() => extractUserQueryText(events), [events]);
  const execSections = useMemo(() => buildExecutionTraceSections(events), [events]);
  const planPreviewTtlRemainingSec = useMemo(() => {
    if (!pendingPlanConfirm) return null;
    void ttlTick;
    const elapsed = (Date.now() - pendingPlanConfirm.receivedAtMs) / 1000;
    return Math.max(0, Math.floor(pendingPlanConfirm.expiresInSec - elapsed));
  }, [pendingPlanConfirm, ttlTick]);
  const timelineEvents = useMemo(() => {
    let xs = events;
    if (!debugRouter) {
      xs = xs.filter((e) => e.type !== "router.evidence.details" && e.type !== "agent.intent");
    }
    if (!debugLlmPrompts) {
      xs = xs.filter((e) => e.type !== "agent.debug.llm_prompts");
    }
    return xs;
  }, [debugRouter, debugLlmPrompts, events]);

  /** 浏览器下 setTimeout 返回 number，与 NodeJS.Timeout 区分 */
  const copyFeedbackTimerRef = useRef<number | null>(null);
  const [sectionCopyFeedback, setSectionCopyFeedback] = useState<"timeline" | "exec" | null>(null);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current != null) {
        window.clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = null;
      }
    };
  }, []);

  const handleCopyTimeline = useCallback(async () => {
    const body =
      timelineEvents.length === 0
        ? "（暂无 Timeline 事件）"
        : `=== Timeline（共 ${timelineEvents.length} 条，JSON）===\n${safeStringify(timelineEvents)}`;
    const ok = await copyPlainToClipboard(body);
    if (!ok) return;
    if (copyFeedbackTimerRef.current != null) window.clearTimeout(copyFeedbackTimerRef.current);
    setSectionCopyFeedback("timeline");
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setSectionCopyFeedback(null);
      copyFeedbackTimerRef.current = null;
    }, 2000);
  }, [timelineEvents]);

  const handleCopyExecutionTrace = useCallback(async () => {
    const body = buildExecutionTraceCopyText(queryTextTrace, execSections);
    const ok = await copyPlainToClipboard(body);
    if (!ok) return;
    if (copyFeedbackTimerRef.current != null) window.clearTimeout(copyFeedbackTimerRef.current);
    setSectionCopyFeedback("exec");
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setSectionCopyFeedback(null);
      copyFeedbackTimerRef.current = null;
    }, 2000);
  }, [queryTextTrace, execSections]);

  const send = async (q: string, opts?: { planExecutionToken?: string }) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const planToken = opts?.planExecutionToken?.trim() ?? "";
    const sendingWithPlanToken = Boolean(planToken);

    if (!sendingWithPlanToken) {
      setPendingPlanConfirm(null);
      dismissedPlanTokenRef.current = null;
    } else {
      const pend = pendingPlanConfirmRef.current;
      if (
        !pend ||
        pend.token !== planToken ||
        pend.boundQuery.trim() !== trimmed ||
        pend.sessionId !== sessionId
      ) {
        setErrorText("无法按预览执行：令牌与当前会话或问题不一致，请重新发起问题。");
        return;
      }
    }

    const usedPlanTokenAtSend = sendingWithPlanToken;

    lastQueryRef.current = trimmed;
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
      payload: { text: trimmed },
    };
    roundEventsRef.current = [userEvent];
    setEvents([userEvent]);
    setTimelineBatchOpen(false);
    setTimelineBatchNonce((n) => n + 1);

    try {
      const ac = new AbortController();
      streamAbortRef.current = ac;

      const res = await fetchWithAuthRecovery("/api/py/unified/chat/stream", {
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
          query: trimmed,
          prefer,
          debug_router: debugRouter,
          ...(debugLlmPrompts ? { debug_llm_prompts: true } : {}),
          ...(sendingWithPlanToken ? { plan_execution_token: planToken } : {}),
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

      // 先用本地 runId 占位；首帧 **meta.payload.run_id** 为服务端 canonical（与 JSON 日志 / done 一致），须立即切换并回填已入列事件，否则 tool.call.end 等与后端 run_id 对不齐
      let currentRunId = runId;
      let donePayload: unknown = null;
      /** 本轮 SSE 是否收到 done（与 lastDone 同源，供 transcript 判定） */
      let streamLastDone: {
        ok: boolean;
        mode: string;
        run_id: string;
        session_id: string;
        request_id: string;
        persist?: Record<string, unknown>;
      } | null = null;

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
            const rawObj = j as Record<string, unknown>;
            const chainType = typeof rawObj.type === "string" ? rawObj.type : "";
            let serverRunFromMeta: string | null = null;
            if (chainType === "meta") {
              const pl = rawObj.payload;
              if (pl && typeof pl === "object") {
                const rid = (pl as Record<string, unknown>).run_id;
                if (typeof rid === "string" && rid.trim()) {
                  serverRunFromMeta = rid.trim();
                }
              }
            }
            const srvMeta = serverRunFromMeta;
            if (srvMeta) {
              currentRunId = srvMeta;
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
            setEvents((prev) => {
              const base =
                srvMeta && srvMeta !== runId
                  ? prev.map((e) => (e.run_id === runId ? { ...e, run_id: srvMeta } : e))
                  : prev;
              const next = [...base, ev];
              roundEventsRef.current = next;
              return next;
            });
            if (ev.type === "agent.plan.preview") {
              const pl = ev.payload;
              if (pl && typeof pl === "object" && !Array.isArray(pl)) {
                const rec = pl as Record<string, unknown>;
                if (isValidAgentPlanPreviewPayload(rec)) {
                  const token =
                    typeof rec.plan_execution_token === "string" ? rec.plan_execution_token.trim() : "";
                  if (token && dismissedPlanTokenRef.current !== token) {
                    const boundQuery = extractUserQueryText(roundEventsRef.current);
                    if (boundQuery.trim()) {
                      const ex = rec.expires_in_sec;
                      setPendingPlanConfirm({
                        token,
                        boundQuery: boundQuery.trim(),
                        sessionId: sessionIdRef.current,
                        expiresInSec:
                          typeof ex === "number" && Number.isFinite(ex) && ex >= 0 ? Math.floor(ex) : 0,
                        receivedAtMs: Date.now(),
                        sqlDraft: typeof rec.sql_draft === "string" ? rec.sql_draft : "",
                        warnings: Array.isArray(rec.warnings) ? [...rec.warnings] : [],
                        planId: typeof rec.plan_id === "string" ? rec.plan_id : "",
                        tool: typeof rec.tool === "string" ? rec.tool : "",
                      });
                    }
                  }
                }
              }
            }
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
              const persistRaw = obj.persist;
              const persist =
                persistRaw && typeof persistRaw === "object" && !Array.isArray(persistRaw)
                  ? (persistRaw as Record<string, unknown>)
                  : undefined;
              const doneSnap = {
                ok,
                mode,
                run_id: rid.trim(),
                session_id: session,
                request_id: requestId.trim(),
                ...(persist ? { persist } : {}),
              };
              streamLastDone = doneSnap;
              setLastDone(doneSnap);

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

      // done 后收尾：先 flushSync 读到与 DOM 一致的 events（await 循环末尾可能尚有未提交的 setEvents）
      // 再在 updater 外 setFinalAnswer / setTranscript，避免 Strict Mode 重复执行 updater 导致 transcript 双写、key 重复。
      // D2：仅当收到 done 且 ok、且有非空最终答时追加 transcript；流失败路径不追加（与 PR 说明一致）
      void donePayload;
      let latestEvents: ChainEvent[] = [];
      flushSync(() => {
        setEvents((prev) => {
          latestEvents = prev;
          return prev;
        });
      });
      roundEventsRef.current = latestEvents;
      const inferred = extractFinalAnswer({ answer: undefined, events: latestEvents });
      if (inferred.trim()) {
        setFinalAnswer((fa) => (fa.trim() ? fa : inferred));
      }
      if (streamLastDone?.ok && lastQueryRef.current.trim() && inferred.trim()) {
        const uid = lastQueryRef.current.trim();
        const aid = inferred.trim();
        const rowId = crypto.randomUUID();
        setTranscript((t) => [...t, { id: rowId, user: uid, assistant: aid }]);
      }
      if (streamLastDone?.ok && usedPlanTokenAtSend) {
        setPendingPlanConfirm(null);
        dismissedPlanTokenRef.current = null;
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorText(msg);
    } finally {
      setLoading(false);
      streamAbortRef.current = null;
    }
  };

  const sendRef = useRef(send);
  sendRef.current = send;

  /** TTL 倒计时 + 过期后自动以同问句无令牌重拉 SSE，刷新 Timeline / 最终输出 */
  useEffect(() => {
    if (!pendingPlanConfirm) return;
    const id = window.setInterval(() => {
      setTtlTick((n) => n + 1);
      const pend = pendingPlanConfirmRef.current;
      if (!pend || loadingRef.current) return;
      const elapsed = (Date.now() - pend.receivedAtMs) / 1000;
      const remaining = Math.max(0, Math.floor(pend.expiresInSec - elapsed));
      if (remaining > 0) return;
      const q = pend.boundQuery.trim();
      if (!q) return;
      setPendingPlanConfirm(null);
      void sendRef.current(q);
    }, 1000);
    return () => window.clearInterval(id);
  }, [pendingPlanConfirm?.token]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 p-4 text-sm text-slate-600">
        正在加载…
      </div>
    );
  }

  const executionLinkSection = (
    <section className="flex min-h-[72vh] min-w-0 flex-col rounded-2xl border border-[color:var(--color-border)] bg-white/40">
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-serif text-sm text-[#2c2c2c]">执行链路</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            按 SSE 顺序展示 Agent 子步与决策（每段 <span className="font-mono">agent.llm.*</span> 单独成块，不混拼）；明细见左侧 Timeline
          </div>
        </div>
        <button
          type="button"
          className={chainTimelineExpandBtnClass}
          onClick={() => void handleCopyExecutionTrace()}
          title="复制当前执行链路摘要（纯文本）"
        >
          {sectionCopyFeedback === "exec" ? "已复制" : "复制"}
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
                    <div className="text-[12px] font-medium text-slate-800">{s.message.trim() ? s.message : "—"}</div>
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
                      <div className="text-[10px] font-medium uppercase tracking-wide text-indigo-900/90">sql_draft</div>
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
                  <div className="font-mono text-[12px] text-amber-900">
                    tool.call.start · {s.tool}
                  </div>
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
                    <div className="whitespace-pre-wrap text-[12px] leading-relaxed text-rose-950">{s.message}</div>
                    {s.persistHint ? (
                      <div>
                        <div className="text-[10px] font-medium text-rose-800/90">persist（done 同源摘要）</div>
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

  const timelineSection = (
    <section className="flex min-h-[72vh] min-w-0 flex-col rounded-2xl border border-[color:var(--color-border)] bg-white/40">
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-serif text-sm text-[#2c2c2c]">Timeline</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            vNext：SSE 到达序（含 agent.llm.*）；展开查看详情
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <button
            type="button"
            className={chainTimelineExpandBtnClass}
            onClick={() => void handleCopyTimeline()}
            title="复制当前 Timeline 事件（JSON）"
          >
            {sectionCopyFeedback === "timeline" ? "已复制" : "复制"}
          </button>
          {timelineEvents.length > 0 ? (
            <>
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
            </>
          ) : null}
        </div>
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
            <p className="text-sm leading-relaxed text-slate-700">
              请输入 <strong>ChatBI DB 明文访问令牌</strong>（
              <span className="font-mono">chatbi_access_tokens</span>
              ），点击<strong>解锁</strong>：由 Next BFF 转发 <span className="font-mono">GET /api/py/chatbi/access/verify</span>{" "}
              到 Python 校验；**不**使用 <span className="font-mono">NEXT_PUBLIC_ADMIN_SECRET</span>
              。通过后令牌写入 <span className="font-mono">localStorage</span>，后续 Unified / 历史请求均带{" "}
              <span className="font-mono">Authorization: Bearer &lt;明文&gt;</span>（与 Python 约定一致）。
            </p>
            <label className="block text-[11px] text-slate-500">
              访问令牌（明文）
              <input
                ref={tokenInputRef}
                type="password"
                value={credentialInput}
                onChange={(e) => {
                  setCredentialInput(e.target.value);
                  setUnlockError(null);
                }}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                placeholder="解锁后请求带 Authorization: Bearer <明文>"
                autoComplete="off"
              />
            </label>
            {unlockError ? (
              <p className="text-[12px] leading-relaxed text-rose-600/90">{unlockError}</p>
            ) : null}
            <button
              type="button"
              disabled={unlockBusy}
              onClick={() => {
                void (async () => {
                  setUnlockError(null);
                  const v = credentialInput.trim();
                  if (!v) {
                    setUnlockError("请输入 ChatBI 明文 token");
                    return;
                  }
                  const plain = v.replace(/^bearer\s+/i, "").trim();
                  if (!plain) {
                    setUnlockError("请输入有效的 ChatBI 明文 token");
                    return;
                  }
                  setUnlockBusy(true);
                  try {
                    const gate = await requestChatbiAccessVerify({ plain });
                    if (!gate.ok) {
                      setUnlockError(gate.message);
                      return;
                    }
                    writeChatbiToken(plain);
                    setChatbiToken(plain);
                    setCredentialInput("");
                  } finally {
                    setUnlockBusy(false);
                  }
                })();
              }}
              className="w-full rounded-xl bg-[#2c2c2c] px-3 py-2 text-sm text-[#f9f9f7] hover:opacity-90 disabled:opacity-50"
            >
              {unlockBusy ? "校验中…" : "解锁"}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-3">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-0 flex-1 space-y-2 text-[11px] text-slate-600">
                <p className="leading-relaxed text-slate-600">
                  同一浏览器内连续提问共享上下文，直至点击「新会话」。只要{" "}
                  <span className="font-mono">session_id</span> 不变且后端已落库，刷新或再次进入本页会从{" "}
                  <span className="font-mono">/api/py/chat/history</span> 恢复下方「历史消息」摘要；Timeline
                  仍仅展示当前轮 SSE。
                </p>
                {debugEnabled ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300/80 bg-slate-50/80 px-2 py-1.5 font-mono text-[11px] text-slate-800">
                    <span className="text-slate-500">session_id（前 8 位）</span>
                    <span>{sessionId.slice(0, 8)}</span>
                    <button
                      type="button"
                      className="rounded border border-[color:var(--color-border)] bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
                      onClick={() => void navigator.clipboard.writeText(sessionId)}
                    >
                      复制完整 id
                    </button>
                  </div>
                ) : null}
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
              <div className="flex shrink-0 flex-col gap-1">
                <span className="text-[11px] text-slate-500">页面调试</span>
                {debugEnabled ? (
                  <button
                    type="button"
                    onClick={() => syncDebugUrlParam(false)}
                    className="rounded-xl border border-slate-400/40 bg-white/80 px-3 py-2 text-[12px] text-slate-800 hover:bg-slate-50"
                    title="从地址栏移除 debug 参数并隐藏调试区"
                  >
                    关闭调试模式
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => syncDebugUrlParam(true)}
                    className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-950 hover:bg-amber-500/15"
                    title="等同在地址栏加上 ?debug=1"
                  >
                    开启调试模式
                  </button>
                )}
              </div>
            </div>
          </section>

          {!historyReady ? (
            <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-3">
              <p className="text-[12px] text-slate-500">正在加载本会话历史…</p>
            </section>
          ) : historyError ? (
            <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 px-4 py-3">
              <p className="text-[12px] text-amber-900/90">
                历史接口不可用（将无法从服务端恢复摘要）：{historyError}
              </p>
            </section>
          ) : transcript.length > 0 ? (
            <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
              <div className="border-b border-[color:var(--color-border)] px-4 py-3">
                <div className="font-serif text-sm text-[#2c2c2c]">历史消息</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  已完成轮次摘要（来自 rag_conversation_logs）；当前轮 Timeline 与下方「消息」区仅展示本轮
                </div>
              </div>
              <div className="max-h-[36vh] space-y-3 overflow-auto px-4 py-3">
                {transcript.map((row) => (
                  <div
                    key={row.id}
                    className="space-y-2 rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/80 px-3 py-2"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400">user</div>
                      <div className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900">{row.user}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">assistant</div>
                      <div className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">{row.assistant}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {lastDone?.persist && lastDone.persist.ok === false ? (
            <section className="rounded-2xl border border-rose-300/70 bg-rose-50/90 px-4 py-3">
              <div className="font-serif text-sm text-rose-950">会话落库失败</div>
              <p className="mt-1 text-[12px] leading-relaxed text-rose-900/95">
                本轮回答已生成，但写入 <span className="font-mono">rag_conversation_logs</span> 未成功，多轮上下文与历史摘要可能缺本轮。请检查
                Supabase 网络或表结构；详情见下方 Debug 或 Timeline 中的{" "}
                <span className="font-mono">error · agent_db</span> 事件。
              </p>
              <pre className="mt-2 max-h-[20vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-rose-200/80 bg-white/80 p-2 font-mono text-[10px] text-rose-950">
                {safeStringify(lastDone.persist)}
              </pre>
            </section>
          ) : null}

          {lastDone && lastDone.ok === false ? (
            <section className="rounded-2xl border border-rose-300/70 bg-rose-50/90 px-4 py-3">
              <div className="font-serif text-sm text-rose-950">本轮未完成（done · ok=false）</div>
              <p className="mt-1 text-[12px] leading-relaxed text-rose-900/95">
                请查看左侧 Timeline 或右侧执行链路中的 <span className="font-mono">error</span> 链事件；开启页面{" "}
                <span className="font-mono">?debug=1</span> 可查看 <span className="font-mono">done</span> 完整载荷。
              </p>
              {debugEnabled ? (
                <pre className="mt-2 max-h-[20vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-rose-200/80 bg-white/80 p-2 font-mono text-[10px] text-rose-950">
                  {safeStringify(lastDone)}
                </pre>
              ) : null}
            </section>
          ) : null}

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

            {debugEnabled ? (
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] text-slate-700">LLM Prompt 调试</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      开启后请求体附带 <span className="font-mono">debug_llm_prompts: true</span>
                      ，Timeline 展示{" "}
                      <span className="font-mono">agent.debug.llm_prompts</span>（含 Intent / 工具链各段
                      messages）。服务端亦可设环境变量{" "}
                      <span className="font-mono">CHATBI_V2_DEBUG_LLM_PROMPTS=1</span> 强制开启。内容可能较长且含
                      system 指令，请勿对不可信受众默认开启。
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const next = !debugLlmPrompts;
                      setDebugLlmPrompts(next);
                      if (loading && lastQueryRef.current.trim()) {
                        streamAbortRef.current?.abort();
                        streamAbortRef.current = null;
                        await send(lastQueryRef.current.trim());
                      }
                    }}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-[11px]",
                      debugLlmPrompts
                        ? "border-orange-500/40 bg-orange-500/10 text-orange-950"
                        : "border-[color:var(--color-border)] bg-white/60 text-slate-700",
                    ].join(" ")}
                    title={
                      debugLlmPrompts
                        ? "点击关闭（会清理当前会话中的 LLM prompt 调试事件）"
                        : "点击开启（必要时会重连 SSE）"
                    }
                  >
                    {debugLlmPrompts ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            ) : null}

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

              {pendingPlanConfirm ? (
                <div className="space-y-2 rounded-xl border border-indigo-300/70 bg-indigo-50/50 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-indigo-950">低置信 · 预览 SQL 已就绪</div>
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
                  <div className="max-h-[28vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-indigo-200/80 bg-white/70 px-2 py-2 font-mono text-[11px] text-slate-900">
                    {pendingPlanConfirm.sqlDraft.trim() ? pendingPlanConfirm.sqlDraft : "（无 sql_draft）"}
                  </div>
                  {pendingPlanConfirm.warnings.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-800">
                      {pendingPlanConfirm.warnings.map((w, wi) => (
                        <li key={wi}>
                          {typeof w === "string" ? w : safeStringify(w)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={
                        loading ||
                        sessionId !== pendingPlanConfirm.sessionId ||
                        planPreviewTtlRemainingSec === 0
                      }
                      onClick={() => {
                        setDraft(pendingPlanConfirm.boundQuery);
                        void send(pendingPlanConfirm.boundQuery, {
                          planExecutionToken: pendingPlanConfirm.token,
                        });
                      }}
                      className="rounded-xl bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-800 disabled:opacity-40"
                    >
                      按预览执行
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        const q = pendingPlanConfirm.boundQuery.trim();
                        setPendingPlanConfirm(null);
                        if (q) void send(q);
                      }}
                      className="rounded-xl border border-[color:var(--color-border)] bg-white/70 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      取消（丢弃令牌）
                    </button>
                  </div>
                </div>
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
                    setTranscript([]);
                    setEvents([]);
                    roundEventsRef.current = [];
                    setPendingPlanConfirm(null);
                    dismissedPlanTokenRef.current = null;
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
