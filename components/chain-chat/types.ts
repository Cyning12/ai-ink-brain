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

export type ChainEvent = {
  type: ChainEventType;
  ts: number; // ms
  run_id: string;
  step_id: string;
  payload: Record<string, unknown>;
};

export type ChainChatResponse = {
  ok: boolean;
  run_id?: string;
  events?: ChainEvent[];
  answer?: string;
  error?: string;
};

