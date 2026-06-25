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

export type OpsRun = {
  id: string;
  repo_id: string;
  session_id: string | null;
  query: string;
  route: "fast" | "deep";
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
  route: "fast" | "deep";
  status: OpsRun["status"];
  answer?: string;
};

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

export function isRunActive(status: OpsRun["status"]): boolean {
  return status === "queued" || status === "running";
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

/** 判断 event_type 是否属于 Review 阶段。 */
export function isReviewEventType(eventType: string): boolean {
  return eventType === "review.pass" || eventType === "review.fail" || eventType === "review.partial";
}

/** 将事件列表按 Deep run 阶段分区。 */
export function partitionThinkingChain(events: OpsRunEvent[]): ThinkingChainItem[] {
  const items: ThinkingChainItem[] = [];
  let currentPhase: ThinkingChainPhase = "other";

  for (const event of events) {
    const { event_type } = event;

    // 阶段切换
    if (event_type === "agent.delegate.start" || event_type === "agent.tool.result") {
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
    case "agent.delegate.start":
      return `委派 ${typeof payload.agent === "string" ? payload.agent : "—"}`;
    case "agent.tool.result": {
      const tool = parseAgentToolResultPayload(payload);
      const parts: string[] = ["工具返回结果"];
      if (tool.issue_number != null) parts.push(`#${tool.issue_number}`);
      if (tool.confidence != null) parts.push(`置信度 ${tool.confidence.toFixed(2)}`);
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
    case "final.answer":
      return "生成最终答案";
    default:
      return event.event_type;
  }
}
