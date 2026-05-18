/** `event: done` 解析后的终态（与 UnifiedChatPageClient `lastDone` 对齐） */
export type ChatbiDonePayload = {
  ok: boolean;
  mode: string;
  run_id: string;
  session_id: string;
  request_id: string;
  persist?: Record<string, unknown>;
  error?: string;
};

/** POST unified chat stream 请求体（ChatBI 原生，非 OpenAI messages） */
export type ChatbiStreamRequestBody = {
  session_id: string;
  query: string;
  prefer: string;
  debug_router?: boolean;
  debug_llm_prompts?: boolean;
  plan_execution_token?: string;
};
