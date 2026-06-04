import type { IntentPathObs } from "@/lib/unified-chat/chainEventSelectors";

/** Intent 路径枚举 → 中文（Debug / 路由摘要共用） */
export const INTENT_PATH_LABEL: Record<string, string> = {
  llm: "LLM",
  llm_retry: "LLM 重试",
  v1_fallback: "Intent 超时 → V1",
  heuristic: "启发式",
};

export function formatIntentPathLabel(path: string | null | undefined): string {
  if (!path || !path.trim()) return "—";
  const key = path.trim();
  return INTENT_PATH_LABEL[key] ?? key;
}

export function formatIntentAttempt(attempt: number | null | undefined): string {
  if (attempt == null || !Number.isFinite(attempt)) return "—";
  return `第 ${Math.round(attempt)} 次`;
}

/** Timeline 标题后缀：` · LLM 重试#2 · 仲裁`（无字段时返回空串） */
export function buildAgentIntentTitleSuffix(obs: IntentPathObs): string {
  const parts: string[] = [];
  if (obs.intent_path) {
    const label = formatIntentPathLabel(obs.intent_path);
    if (obs.intent_path === "llm_retry" && obs.intent_attempt != null) {
      parts.push(`${label}#${obs.intent_attempt}`);
    } else {
      parts.push(label);
    }
  }
  if (obs.hints_arbitration?.applied) {
    parts.push("仲裁");
  }
  return parts.length ? ` · ${parts.join(" · ")}` : "";
}

/** 执行链路 / evidence 摘要一行 */
export function buildIntentPathSummaryLine(obs: IntentPathObs): string | null {
  const parts: string[] = [];
  if (obs.intent_path) parts.push(formatIntentPathLabel(obs.intent_path));
  if (obs.intent_attempt != null) parts.push(formatIntentAttempt(obs.intent_attempt));
  if (obs.hints_arbitration?.applied) {
    parts.push(`配置仲裁 → ${obs.hints_arbitration.reason.trim() || "rag"}`);
  }
  if (obs.agent_step_routing === "agent_soft_timeout_v1") {
    parts.push("Agent 软超时 → V1");
  }
  return parts.length ? parts.join(" · ") : null;
}
