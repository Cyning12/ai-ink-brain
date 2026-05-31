import {
  isValidText2SqlPhaseEndPayload,
  isValidText2SqlPhaseStartPayload,
} from "@/lib/unified-chat/text2sqlPhaseSse";

export const AGENT_PLAN_PREVIEW_TOOL_RAG = "rag_search";
export const AGENT_PLAN_PREVIEW_TOOL_TEXT2SQL = "text2sql_query";

function hasAgentPlanPreviewCommonKeys(p: Record<string, unknown>): boolean {
  if (typeof p.plan_id !== "string" || !p.plan_id.trim()) return false;
  if (typeof p.tool !== "string" || !p.tool.trim()) return false;
  if (!Array.isArray(p.warnings)) return false;
  if (typeof p.plan_execution_token !== "string" || !p.plan_execution_token.trim()) return false;
  const exp = p.expires_in_sec;
  if (typeof exp !== "number" || !Number.isFinite(exp) || exp < 0) return false;
  return true;
}

/** manifest `agent.clarify` 最小键校验；缺字段则整帧丢弃（策略 B） */
export function isValidAgentClarifyPayload(p: Record<string, unknown>): boolean {
  const sn = p.step_number;
  if (typeof sn !== "number" || !Number.isFinite(sn)) return false;
  if (typeof p.message !== "string") return false;
  if (typeof p.prompt_for_user !== "string") return false;
  return true;
}

/** manifest `agent.plan.preview` 最小键校验；按 tool 分支；缺字段则整帧丢弃（策略 B） */
export function isValidAgentPlanPreviewPayload(p: Record<string, unknown>): boolean {
  if (!hasAgentPlanPreviewCommonKeys(p)) return false;

  const tool = p.tool as string;
  if (tool === AGENT_PLAN_PREVIEW_TOOL_RAG) {
    const rq = p.rewrite_query;
    return typeof rq === "string" && rq.trim().length > 0;
  }
  if (tool === AGENT_PLAN_PREVIEW_TOOL_TEXT2SQL) {
    return typeof p.sql_draft === "string";
  }
  // 未知 tool：保守要求 sql_draft（与 5-2 前向兼容）
  return typeof p.sql_draft === "string";
}

export { isValidText2SqlPhaseStartPayload, isValidText2SqlPhaseEndPayload };
