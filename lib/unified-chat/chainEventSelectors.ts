import type { ChainEvent } from "@/components/chain-chat/types";
import { extractTextFromPayload } from "@/lib/unified-chat/executionTrace";

export type ChatRow = { id: string; role: "user" | "assistant"; text: string };

export function extractUserQueryText(events: ChainEvent[]): string {
  const u = events.find((x) => x.type === "user.message");
  const t = u && typeof u.payload.text === "string" ? u.payload.text : "";
  return t.trim();
}

export function extractMessagesFromEvents(events: ChainEvent[]): ChatRow[] {
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

export function extractFinalAnswer(args: {
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

export type RouterDecision = {
  prefer?: string;
  candidate_mode?: string;
  final_mode?: string;
  rule_hits?: string[];
  evidence?: Record<string, unknown>;
  fallback?: string | null;
};

export function extractRouterDecision(events: ChainEvent[]): RouterDecision | null {
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

export type RouterEvidence = {
  candidate_mode?: string;
  final_mode?: string;
  fallback?: string | null;
  ddl?: Record<string, unknown>;
  fts?: Record<string, unknown>;
  raw: Record<string, unknown>;
};

export function extractRouterEvidence(events: ChainEvent[]): RouterEvidence | null {
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

export type HintsArbitrationObs = Readonly<{
  applied: true;
  reason: string;
}>;

export type IntentPathObs = Readonly<{
  intent_path: string | null;
  intent_attempt: number | null;
  hints_arbitration: HintsArbitrationObs | null;
  agent_step_routing: "intent" | "agent_soft_timeout_v1" | null;
}>;

/** 从 agent.intent / agent.think / router.decision.evidence 解析 optional 路径字段；缺字段不抛错 */
export function extractIntentPathObs(
  payload: Record<string, unknown> | null | undefined,
): IntentPathObs {
  const obj = payload && typeof payload === "object" ? payload : {};
  const intent_path =
    typeof obj.intent_path === "string" && obj.intent_path.trim() ? obj.intent_path.trim() : null;
  const attemptRaw = obj.intent_attempt;
  const intent_attempt =
    typeof attemptRaw === "number" && Number.isFinite(attemptRaw) && attemptRaw >= 1
      ? Math.round(attemptRaw)
      : null;

  let hints_arbitration: HintsArbitrationObs | null = null;
  const ha = obj.hints_arbitration;
  if (ha && typeof ha === "object" && !Array.isArray(ha)) {
    const h = ha as Record<string, unknown>;
    if (h.applied === true && typeof h.reason === "string") {
      hints_arbitration = { applied: true, reason: h.reason };
    }
  }

  const routingRaw = obj.agent_step_routing;
  const agent_step_routing =
    routingRaw === "intent" || routingRaw === "agent_soft_timeout_v1" ? routingRaw : null;

  return { intent_path, intent_attempt, hints_arbitration, agent_step_routing };
}

export type AgentIntentObsRow = {
  tool: string;
  mode: string;
  confidence: string;
  cache: string;
  cache_key_hash: string;
  latency_ms: string;
  path: IntentPathObs;
};

export function extractAgentIntentObs(events: ChainEvent[]): AgentIntentObsRow | null {
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
  return {
    tool,
    mode,
    confidence: conf,
    cache,
    cache_key_hash,
    latency_ms,
    path: extractIntentPathObs(obj),
  };
}

export function modeTone(mode: string): string {
  const m = mode.trim();
  if (m === "text2sql") return "border-indigo-500/20 bg-indigo-500/10 text-indigo-800";
  if (m === "rag") return "border-teal-500/20 bg-teal-500/10 text-teal-800";
  if (m === "no_data") return "border-slate-500/20 bg-slate-500/10 text-slate-700";
  if (m.startsWith("tool:")) return "border-amber-500/20 bg-amber-500/10 text-amber-800";
  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-800";
}

