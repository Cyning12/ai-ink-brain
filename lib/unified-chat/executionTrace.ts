import type { ChainEvent } from "@/components/chain-chat/types";
import { isValidAgentPlanPreviewPayload } from "@/lib/unified-chat/sse";
import { extractText2sqlPhasesMsFromToolOutput } from "@/lib/unified-chat/text2sqlPhaseSse";

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

export function phaseHintCn(phase: string): string {
  const p = phase.trim().toLowerCase();
  if (p === "intent") return "使用 LLM 意图识别";
  if (p === "direct") return "直接生成";
  if (p === "rag_generate") return "RAG 生成";
  if (p === "text2sql_sql") return "Text2SQL SQL";
  if (p === "text2sql_summary") return "Text2SQL 总结";
  return phase || "LLM 子步";
}

/** 右栏「执行链路」：按 SSE 顺序抽取决策/子步，便于阅读（非全局 delta 混拼） */
export type ExecSection =
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

export function buildExecutionTraceSections(events: ChainEvent[]): ExecSection[] {
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
export function buildExecutionTraceCopyText(query: string, sections: ExecSection[]): string {
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

export function extractTextFromPayload(payload: Record<string, unknown>): string {
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
