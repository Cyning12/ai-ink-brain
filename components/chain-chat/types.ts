export type ChainEventType =
  | "user.message"
  | "assistant.message"
  | "meta"
  | "router.decision"
  | "router.evidence"
  | "router.evidence.details"
  | "tool.call.start"
  | "tool.call.end"
  | "rag.query_expand"
  | "sql.result"
  | "rag.sources"
  | "latency"
  | "chart.image"
  | "chart.spec"
  | "error"
  | "agent.step.start"
  | "agent.think"
  | "agent.clarify"
  | "agent.plan.preview"
  | "agent.intent"
  | "agent.llm.start"
  | "agent.llm.delta"
  | "agent.llm.end"
  | "agent.llm.truncated"
  | "text2sql.phase.start"
  | "text2sql.phase.end"
  | "agent.step.end"
  | "agent.final"
  | "agent.debug.llm_prompts";

/** manifest `agent.clarify` 最小 payload；前端仅渲染这些键（见 api-python `_contract_manifest.json`） */
export type AgentClarifyPayload = Readonly<{
  step_number: number;
  message: string;
  prompt_for_user: string;
}>;

/** manifest `agent.plan.preview` 公共 payload 键（`_contract_manifest.json` · C1@2026-05-31） */
export type AgentPlanPreviewPayloadBase = Readonly<{
  plan_id: string;
  tool: string;
  warnings: unknown[];
  plan_execution_token: string;
  expires_in_sec: number;
}>;

/** Text2SQL 低置信预览（tool=text2sql_query） */
export type AgentPlanPreviewText2SqlPayload = AgentPlanPreviewPayloadBase &
  Readonly<{
    tool: "text2sql_query";
    sql_draft: string;
  }>;

/** RAG 低置信预览（tool=rag_search） */
export type AgentPlanPreviewRagPayload = AgentPlanPreviewPayloadBase &
  Readonly<{
    tool: "rag_search";
    rewrite_query: string;
    sql_draft?: string;
    planned_top_k?: number;
    preview_headlines?: string[];
  }>;

export type AgentPlanPreviewPayload = AgentPlanPreviewText2SqlPayload | AgentPlanPreviewRagPayload;

export type ChainEvent = {
  type: ChainEventType;
  ts: number; // ms
  run_id: string;
  step_id: string;
  payload: Record<string, unknown>;
};

/** 服务端 SSE `chain` 已登记 type（策略 B：不在集合内则丢弃）；不含客户端注入的 user.message */
export type ServerChainEventType = Exclude<ChainEventType, "user.message">;

export const UNIFIED_SSE_CHAIN_TYPE_WHITELIST = new Set<string>(
  [
    "meta",
    "router.decision",
    "router.evidence",
    "router.evidence.details",
    "tool.call.start",
    "tool.call.end",
    "rag.query_expand",
    "rag.sources",
    "sql.result",
    "assistant.message",
    "latency",
    "chart.image",
    "chart.spec",
    "error",
    "agent.step.start",
    "agent.think",
    "agent.clarify",
    "agent.plan.preview",
    "agent.intent",
    "agent.llm.start",
    "agent.llm.delta",
    "agent.llm.end",
    "agent.llm.truncated",
    "text2sql.phase.start",
    "text2sql.phase.end",
    "agent.step.end",
    "agent.final",
    "agent.debug.llm_prompts",
  ] as const satisfies readonly ServerChainEventType[],
);

export type ChainChatResponse = {
  ok: boolean;
  run_id?: string;
  events?: ChainEvent[];
  answer?: string;
  error?: string;
};

