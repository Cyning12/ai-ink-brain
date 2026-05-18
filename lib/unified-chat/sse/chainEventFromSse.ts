import type { ChainEvent } from "@/components/chain-chat/types";
import { UNIFIED_SSE_CHAIN_TYPE_WHITELIST } from "@/components/chain-chat/types";
import {
  isValidAgentClarifyPayload,
  isValidAgentPlanPreviewPayload,
  isValidText2SqlPhaseEndPayload,
  isValidText2SqlPhaseStartPayload,
} from "@/lib/unified-chat/sse/chainPayloadValidators";

/** 将 `event: chain` 的 JSON 归一化为 `ChainEvent`；白名单外或校验失败返回 null */
export function chainEventFromSse(args: {
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
