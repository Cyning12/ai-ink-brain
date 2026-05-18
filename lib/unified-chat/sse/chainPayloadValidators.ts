import {
  isValidText2SqlPhaseEndPayload,
  isValidText2SqlPhaseStartPayload,
} from "@/lib/unified-chat/text2sqlPhaseSse";

/** manifest `agent.clarify` 最小键校验；缺字段则整帧丢弃（策略 B） */
export function isValidAgentClarifyPayload(p: Record<string, unknown>): boolean {
  const sn = p.step_number;
  if (typeof sn !== "number" || !Number.isFinite(sn)) return false;
  if (typeof p.message !== "string") return false;
  if (typeof p.prompt_for_user !== "string") return false;
  return true;
}

/** manifest `agent.plan.preview` 最小键校验；缺字段则整帧丢弃（策略 B） */
export function isValidAgentPlanPreviewPayload(p: Record<string, unknown>): boolean {
  if (typeof p.plan_id !== "string" || !p.plan_id.trim()) return false;
  if (typeof p.tool !== "string") return false;
  if (typeof p.sql_draft !== "string") return false;
  if (!Array.isArray(p.warnings)) return false;
  if (typeof p.plan_execution_token !== "string" || !p.plan_execution_token.trim()) return false;
  const exp = p.expires_in_sec;
  if (typeof exp !== "number" || !Number.isFinite(exp) || exp < 0) return false;
  return true;
}

export { isValidText2SqlPhaseStartPayload, isValidText2SqlPhaseEndPayload };
