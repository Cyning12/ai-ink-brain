"use client";

export type OpsCitation = {
  number: number;
  url: string;
};

export type OpsAgentToolResultPayload = {
  issue_number?: number;
  confidence?: number;
  reasoning?: string;
  suggestion?: string;
  citations?: OpsCitation[];
};

export type OpsReviewPayload = {
  rule?: string;
  message?: string;
  attempt?: number;
};

/** OpsRunEvent payload 可携带 schema_version（P0-2）。 */
export type OpsSchemaVersion = "v1" | string;

/** handoff 事件 schema v1 payload（P0-2）。 */
export type OpsHandoffPayload = {
  schema_version?: OpsSchemaVersion;
  from_route: string;
  to_route: string;
  intent: string;
  slots: Record<string, unknown>;
  agent: string | null;
};

/** review 事件 schema v1 payload（P0-2）。 */
export type OpsReviewV1Payload = {
  schema_version?: OpsSchemaVersion;
  verdict: string;
  rule?: string;
  message?: string;
  attempt?: number;
};

/** clarify.asked 事件 payload（P1-3）。 */
export type OpsClarifyPayload = {
  schema_version?: OpsSchemaVersion;
  clarify_question: string;
  session_id?: string | null;
};

/** checkpoint.resume 事件 payload（P1-2）。 */
export type OpsCheckpointResumePayload = {
  from_run_id: string;
  step: number;
  session_id?: string | null;
};

export type OpsRun = {
  id: string;
  repo_id: string;
  session_id: string | null;
  query: string;
  route: "fast" | "deep" | "react" | "session_00";
  status: "queued" | "running" | "done" | "failed" | "partial";
  final_answer: Record<string, unknown> | null;
  retry_token: string | null;
  created_at: string;
  updated_at: string;
};

export type OpsRunEvent = {
  id?: string;
  run_id: string;
  seq: number;
  ts_ms: number;
  node_id: string | null;
  agent_role: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at?: string;
};

export type OpsChatModel = {
  id: string;
  label: string;
  test_only: boolean;
};

export type OpsChatModelsResponse = {
  provider: string;
  models: OpsChatModel[];
  default_model: string;
  auto_fallback: boolean;
};

export type OpsChatMessagesResponse = {
  run_id: string;
  route: "fast" | "deep" | "react" | "session_00" | "clarify";
  status: OpsRun["status"] | "clarify";
  answer?: string;
  needs_clarification?: boolean;
  clarify_question?: string;
};

/** 多轮对话中的一轮（F0-3）。 */
export type OpsChatTurn = {
  runId: string;
  query: string;
  route: OpsRun["route"] | "clarify";
  status: OpsRun["status"] | "clarify";
  finalAnswer: string;
  clarifyQuestion?: string;
  events: OpsRunEvent[];
  createdAt: string;
};

/** 构造一轮对话的初始结构。 */
export function createOpsChatTurn(options: {
  runId: string;
  query: string;
  route: OpsChatTurn["route"];
  status: OpsChatTurn["status"];
  finalAnswer?: string;
  clarifyQuestion?: string;
  events?: OpsRunEvent[];
  createdAt?: string;
}): OpsChatTurn {
  return {
    runId: options.runId,
    query: options.query,
    route: options.route,
    status: options.status,
    finalAnswer: options.finalAnswer ?? "",
    clarifyQuestion: options.clarifyQuestion,
    events: options.events ?? [],
    createdAt: options.createdAt ?? new Date().toISOString(),
  };
}

/** 追加一轮，并可选保留最近 N 轮。 */
export function appendOpsChatTurn(
  turns: OpsChatTurn[],
  turn: OpsChatTurn,
  options?: { maxTurns?: number },
): OpsChatTurn[] {
  const maxTurns = options?.maxTurns ?? 50;
  const next = [...turns, turn];
  if (next.length > maxTurns) {
    return next.slice(next.length - maxTurns);
  }
  return next;
}

/** 按 runId 更新一轮。 */
export function updateOpsChatTurn(
  turns: OpsChatTurn[],
  runId: string,
  patch: Partial<Omit<OpsChatTurn, "runId">>,
): OpsChatTurn[] {
  return turns.map((turn) => (turn.runId === runId ? { ...turn, ...patch } : turn));
}

/** 从 events 中提取 clarify.asked 问题（F1-1）。 */
export function findClarifyEvent(events: OpsRunEvent[]): OpsClarifyPayload | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (e?.event_type === "clarify.asked") {
      return parseClarifyPayload(e.payload ?? {});
    }
  }
  return null;
}

/** 从 events 中提取 checkpoint.resume 信息（F1-3）。 */
export function findCheckpointResumeEvent(events: OpsRunEvent[]): OpsCheckpointResumePayload | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (e?.event_type === "checkpoint.resume") {
      return parseCheckpointResumePayload(e.payload ?? {});
    }
  }
  return null;
}

/** 从 events 中提取 react.max_steps 步数（F1-3）。 */
export function findReactMaxStepsEvent(events: OpsRunEvent[]): number | null {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (e?.event_type === "react.max_steps") {
      const maxSteps = e.payload?.max_steps;
      if (typeof maxSteps === "number") return maxSteps;
    }
  }
  return null;
}

export type OpsRunEventsResponse = {
  run_id: string;
  after_seq: number;
  events: OpsRunEvent[];
};

export type OpsChatSendResult =
  | { ok: true; data: OpsChatMessagesResponse }
  | { ok: false; error: string };

export type ThinkingChainPhase = "analysis" | "review" | "final" | "other";

export type ThinkingChainItem = {
  seq: number;
  phase: ThinkingChainPhase;
  event: OpsRunEvent;
  toolResult?: OpsAgentToolResultPayload;
  review?: OpsReviewPayload;
};

export type OpsModelFallbackStep = {
  seq: number;
  fromModel: string;
  toModel: string;
  step: string;
  reason: string;
};

/** 从 events 提取百炼 quota 换模链路（按 seq 排序）。 */
export function extractOpsModelFallbackChain(events: OpsRunEvent[]): OpsModelFallbackStep[] {
  const steps: OpsModelFallbackStep[] = [];
  for (const event of events) {
    if (event.event_type !== "llm.model.fallback") continue;
    const payload = event.payload ?? {};
    const fromModel = typeof payload.from_model === "string" ? payload.from_model : "";
    const toModel = typeof payload.to_model === "string" ? payload.to_model : "";
    if (!fromModel || !toModel) continue;
    steps.push({
      seq: event.seq,
      fromModel,
      toModel,
      step: typeof payload.step === "string" ? payload.step : "other",
      reason: typeof payload.reason === "string" ? payload.reason : "quota",
    });
  }
  return steps.sort((a, b) => a.seq - b.seq);
}

/** 汇总 llm.usage 中实际使用的模型（去重、保序）。 */
export function extractOpsLlmModelsUsed(events: OpsRunEvent[]): string[] {
  const seen = new Set<string>();
  const models: string[] = [];
  for (const event of events) {
    if (event.event_type !== "llm.usage") continue;
    const model = event.payload?.model;
    if (typeof model !== "string" || !model.trim() || seen.has(model)) continue;
    seen.add(model);
    models.push(model);
  }
  return models;
}

export function formatModelFallbackChainLabel(
  selectedModel: string,
  fallbackSteps: OpsModelFallbackStep[],
  modelsUsed: string[],
): string {
  if (fallbackSteps.length === 0 && modelsUsed.length <= 1) {
    return selectedModel ? `当前模型 · ${selectedModel}` : "";
  }
  const parts: string[] = [];
  if (selectedModel) parts.push(selectedModel);
  for (const step of fallbackSteps) {
    parts.push(step.toModel);
  }
  const chain = [...new Set(parts)];
  if (modelsUsed.length > 0) {
    return `换模链路 · ${chain.join(" → ")} · 实际 ${modelsUsed.join("、")}`;
  }
  return `换模链路 · ${chain.join(" → ")}`;
}

export async function fetchOpsChatModels(): Promise<OpsChatModelsResponse | null> {
  const res = await fetch("/api/ops/chat/models");
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function sendOpsChatMessage(
  message: string,
  sessionId?: string,
  model?: string,
): Promise<OpsChatSendResult> {
  const body: { message: string; session_id?: string; model?: string } = { message: message.trim() };
  if (sessionId?.trim()) body.session_id = sessionId.trim();
  if (model?.trim()) body.model = model.trim();

  const res = await fetch("/api/ops/chat/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text().catch(() => "");
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err =
      typeof data === "object" && data !== null && typeof (data as Record<string, unknown>).error === "string"
        ? String((data as Record<string, unknown>).error)
        : `${res.status} ${res.statusText}`;
    return { ok: false, error: err };
  }

  if (
    typeof data !== "object" ||
    data === null ||
    typeof (data as Record<string, unknown>).run_id !== "string"
  ) {
    return { ok: false, error: "BFF 返回格式异常，缺少 run_id" };
  }

  return { ok: true, data: data as OpsChatMessagesResponse };
}

export async function fetchOpsRun(runId: string): Promise<OpsRun | null> {
  const res = await fetch(`/api/ops/runs/${encodeURIComponent(runId)}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function fetchOpsRunEvents(runId: string, afterSeq = 0): Promise<OpsRunEventsResponse | null> {
  const res = await fetch(
    `/api/ops/runs/${encodeURIComponent(runId)}/events?after_seq=${encodeURIComponent(String(afterSeq))}`,
  );
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export function isRunActive(status: OpsRun["status"] | "clarify"): boolean {
  return status === "queued" || status === "running";
}

/** 终答区是否可展示：运行中 / 轮询中不展示。 */
export function isOpsRunComplete(options: {
  status?: OpsRun["status"] | "clarify" | null;
  loading: boolean;
  polling: boolean;
}): boolean {
  if (options.loading || options.polling) return false;
  if (!options.status) return false;
  return !isRunActive(options.status);
}

/** 单条 event 复制 JSON。 */
export function serializeOpsEventForCopy(event: OpsRunEvent): string {
  return JSON.stringify(
    {
      seq: event.seq,
      agent_role: event.agent_role,
      event_type: event.event_type,
      payload: event.payload,
    },
    null,
    2,
  );
}

/** 全部 events 复制 JSON。 */
export function serializeOpsEventsForCopy(events: OpsRunEvent[]): string {
  return JSON.stringify(
    events.map((event) => ({
      seq: event.seq,
      agent_role: event.agent_role,
      event_type: event.event_type,
      payload: event.payload,
    })),
    null,
    2,
  );
}

/** 写入剪贴板（浏览器环境）。 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** ReAct 路径相关 event 类型。 */
export function isReactEventType(eventType: string): boolean {
  return (
    eventType === "agent.react_step" ||
    eventType === "agent.tool_call" ||
    eventType === "agent.tool_result" ||
    eventType === "agent.final_answer" ||
    eventType === "react.max_steps"
  );
}

/** 合并新事件，按 seq 去重并排序。 */
export function mergeOpsEvents(existing: OpsRunEvent[], incoming: OpsRunEvent[]): OpsRunEvent[] {
  const map = new Map<number, OpsRunEvent>();
  for (const e of existing) map.set(e.seq, e);
  for (const e of incoming) map.set(e.seq, e);
  return Array.from(map.values()).sort((a, b) => a.seq - b.seq);
}

/** 解析 agent.tool.result 的 v2 payload。 */
export function parseAgentToolResultPayload(payload: Record<string, unknown>): OpsAgentToolResultPayload {
  const citations: OpsCitation[] = [];
  const rawCitations = payload.citations;
  if (Array.isArray(rawCitations)) {
    for (const c of rawCitations) {
      if (
        typeof c === "object" &&
        c !== null &&
        typeof (c as Record<string, unknown>).number === "number" &&
        typeof (c as Record<string, unknown>).url === "string"
      ) {
        citations.push({ number: (c as Record<string, unknown>).number as number, url: (c as Record<string, unknown>).url as string });
      }
    }
  }
  return {
    issue_number: typeof payload.issue_number === "number" ? payload.issue_number : undefined,
    confidence: typeof payload.confidence === "number" ? payload.confidence : undefined,
    reasoning: typeof payload.reasoning === "string" ? payload.reasoning : undefined,
    suggestion: typeof payload.suggestion === "string" ? payload.suggestion : undefined,
    citations: citations.length > 0 ? citations : undefined,
  };
}

/** 解析 review.* 的 payload。 */
export function parseReviewPayload(payload: Record<string, unknown>): OpsReviewPayload {
  return {
    rule: typeof payload.rule === "string" ? payload.rule : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
    attempt: typeof payload.attempt === "number" ? payload.attempt : undefined,
  };
}

/** 解析 handoff 事件 schema v1 payload。 */
export function parseHandoffPayload(payload: Record<string, unknown>): OpsHandoffPayload {
  const slots = typeof payload.slots === "object" && payload.slots !== null
    ? (payload.slots as Record<string, unknown>)
    : {};
  return {
    schema_version: typeof payload.schema_version === "string" ? payload.schema_version : undefined,
    from_route: typeof payload.from_route === "string" ? payload.from_route : "—",
    to_route: typeof payload.to_route === "string" ? payload.to_route : "—",
    intent: typeof payload.intent === "string" ? payload.intent : "—",
    slots,
    agent: typeof payload.agent === "string" ? payload.agent : null,
  };
}

/** 解析 review 事件 schema v1 payload。 */
export function parseReviewV1Payload(payload: Record<string, unknown>): OpsReviewV1Payload {
  return {
    schema_version: typeof payload.schema_version === "string" ? payload.schema_version : undefined,
    verdict: typeof payload.verdict === "string" ? payload.verdict : "—",
    rule: typeof payload.rule === "string" ? payload.rule : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
    attempt: typeof payload.attempt === "number" ? payload.attempt : undefined,
  };
}

/** 解析 clarify.asked 事件 payload。 */
export function parseClarifyPayload(payload: Record<string, unknown>): OpsClarifyPayload {
  return {
    schema_version: typeof payload.schema_version === "string" ? payload.schema_version : undefined,
    clarify_question: typeof payload.clarify_question === "string" ? payload.clarify_question : "",
    session_id: typeof payload.session_id === "string" ? payload.session_id : null,
  };
}

/** 解析 checkpoint.resume 事件 payload。 */
export function parseCheckpointResumePayload(
  payload: Record<string, unknown>,
): OpsCheckpointResumePayload {
  return {
    from_run_id: typeof payload.from_run_id === "string" ? payload.from_run_id : "—",
    step: typeof payload.step === "number" ? payload.step : 0,
    session_id: typeof payload.session_id === "string" ? payload.session_id : null,
  };
}

/** 判断 event_type 是否属于 Review 阶段（含 schema v1 review）。 */
export function isReviewEventType(eventType: string): boolean {
  return eventType === "review.pass" || eventType === "review.fail" || eventType === "review.partial" || eventType === "review";
}

/** 将事件列表按 Deep run 阶段分区。 */
export function partitionThinkingChain(events: OpsRunEvent[]): ThinkingChainItem[] {
  const items: ThinkingChainItem[] = [];
  let currentPhase: ThinkingChainPhase = "other";

  for (const event of events) {
    const { event_type } = event;

    // 阶段切换
    if (event_type === "agent.delegate.start" || event_type === "agent.tool.result" || event_type === "handoff") {
      currentPhase = "analysis";
    } else if (isReviewEventType(event_type)) {
      currentPhase = "review";
    } else if (event_type === "final.answer") {
      currentPhase = "final";
    } else if (event_type === "run.start" || event_type === "run.end" || event_type === "router.decision") {
      currentPhase = "other";
    }

    const item: ThinkingChainItem = { seq: event.seq, phase: currentPhase, event };

    if (event_type === "agent.tool.result") {
      item.toolResult = parseAgentToolResultPayload(event.payload ?? {});
    } else if (isReviewEventType(event_type)) {
      item.review = parseReviewPayload(event.payload ?? {});
    }

    items.push(item);
  }

  return items;
}

/** 从 events 提取最终答案文本（优先 final.answer payload.answer）。 */
export function extractOpsFinalAnswer(events: OpsRunEvent[]): string {
  for (let i = events.length - 1; i >= 0; i -= 1) {
    const e = events[i];
    if (e?.event_type === "final.answer") {
      const payload = e.payload ?? {};
      const answer = typeof payload.answer === "string" ? payload.answer : "";
      if (answer.trim()) return answer.trim();
    }
  }
  return "";
}

/** 提取所有 citations（去重 by url）。 */
export function extractOpsCitations(events: OpsRunEvent[]): OpsCitation[] {
  const seen = new Set<string>();
  const result: OpsCitation[] = [];
  for (const e of events) {
    if (e.event_type !== "agent.tool.result" && e.event_type !== "final.answer") continue;
    const parsed = parseAgentToolResultPayload(e.payload ?? {});
    for (const c of parsed.citations ?? []) {
      if (!seen.has(c.url)) {
        seen.add(c.url);
        result.push(c);
      }
    }
  }
  return result;
}

export function formatOpsEventSummary(event: OpsRunEvent): string {
  const payload = event.payload ?? {};
  switch (event.event_type) {
    case "run.start":
      return "运行开始";
    case "run.end":
      return "运行结束";
    case "router.decision":
      return `路由决策 · ${typeof payload.route === "string" ? payload.route : "—"}`;
    case "handoff": {
      const handoff = parseHandoffPayload(payload);
      const agentPart = handoff.agent ? ` · ${handoff.agent}` : "";
      return `Handoff · ${handoff.from_route} → ${handoff.to_route} · ${handoff.intent}${agentPart}`;
    }
    case "agent.delegate.start":
      return `委派 ${typeof payload.agent === "string" ? payload.agent : "—"}`;
    case "agent.tool.result": {
      const tool = parseAgentToolResultPayload(payload);
      const parts: string[] = ["工具返回结果"];
      if (tool.issue_number != null) parts.push(`#${tool.issue_number}`);
      if (tool.confidence != null) parts.push(`置信度 ${tool.confidence.toFixed(2)}`);
      return parts.join(" · ");
    }
    case "review": {
      const review = parseReviewV1Payload(payload);
      const parts: string[] = ["Review", review.verdict];
      if (review.rule) parts.push(review.rule);
      if (typeof review.attempt === "number") parts.push(`attempt ${review.attempt}`);
      return parts.join(" · ");
    }
    case "review.pass":
      return "Review 通过";
    case "review.fail": {
      const review = parseReviewPayload(payload);
      return `Review 失败 · ${review.rule ?? "—"}`;
    }
    case "review.partial":
      return "Review 部分通过";
    case "clarify.asked": {
      const clarify = parseClarifyPayload(payload);
      return `需要澄清 · ${clarify.clarify_question || "（无问题文本）"}`;
    }
    case "final.answer":
      return "生成最终答案";
    case "llm.model.fallback": {
      const fromModel = typeof payload.from_model === "string" ? payload.from_model : "—";
      const toModel = typeof payload.to_model === "string" ? payload.to_model : "—";
      const step = typeof payload.step === "string" ? payload.step : "";
      return `模型切换 · ${fromModel} → ${toModel}${step ? ` · ${step}` : ""}`;
    }
    case "llm.usage": {
      const model = typeof payload.model === "string" ? payload.model : "—";
      const step = typeof payload.step === "string" ? payload.step : "";
      return `LLM 调用 · ${model}${step ? ` · ${step}` : ""}`;
    }
    case "agent.react_step": {
      const stepNo = typeof payload.step === "number" ? payload.step : "—";
      const thought = typeof payload.thought === "string" ? payload.thought.trim() : "";
      const preview = thought ? ` · ${thought.slice(0, 80)}${thought.length > 80 ? "…" : ""}` : "";
      return `ReAct 思考 · 第 ${stepNo} 步${preview}`;
    }
    case "agent.tool_call": {
      const tool = typeof payload.tool === "string" ? payload.tool : "—";
      return `ReAct 调用工具 · ${tool}`;
    }
    case "agent.tool_result": {
      const tool = typeof payload.tool === "string" ? payload.tool : "—";
      const ok = payload.ok === true;
      const summary = typeof payload.summary === "string" ? payload.summary.slice(0, 60) : "";
      return `ReAct 工具结果 · ${tool} · ${ok ? "成功" : "失败"}${summary ? ` · ${summary}` : ""}`;
    }
    case "agent.final_answer":
      return "ReAct 步内终答";
    case "react.max_steps":
      return `ReAct 达最大步数 · ${typeof payload.max_steps === "number" ? payload.max_steps : "—"}`;
    case "checkpoint.resume": {
      const cp = parseCheckpointResumePayload(payload);
      return `Checkpoint 续跑 · 来自 run ${cp.from_run_id} · 第 ${cp.step} 步`;
    }
    case "checkpoint.save_failed":
      return "Checkpoint 保存失败，仍继续运行";
    case "checkpoint.corrupted":
      return "Checkpoint 损坏，已冷启动";
    case "artifact.write_failed": {
      const kind = typeof payload.kind === "string" ? payload.kind : "—";
      return `Artifact 写入失败 · kind=${kind}`;
    }
    default:
      return event.event_type;
  }
}
