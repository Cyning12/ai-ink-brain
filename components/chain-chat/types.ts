export type ChainEventType =
  | "user.message"
  | "assistant.message"
  | "router.decision"
  | "router.evidence"
  | "router.evidence.details"
  | "tool.call.start"
  | "tool.call.end"
  | "sql.result"
  | "rag.sources"
  | "latency"
  | "chart.image"
  | "chart.spec"
  | "error";

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

