"use client";

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

export async function sendOpsChatMessage(message: string, sessionId?: string): Promise<OpsChatSendResult> {
  const body: { message: string; session_id?: string } = { message: message.trim() };
  if (sessionId?.trim()) body.session_id = sessionId.trim();

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
    case "agent.tool.result":
      return "工具返回结果";
    case "review.pass":
      return "Review 通过";
    case "review.fail":
      return `Review 失败 · ${typeof payload.rule === "string" ? payload.rule : "—"}`;
    case "review.partial":
      return "Review 部分通过";
    case "final.answer":
      return "生成最终答案";
    default:
      return event.event_type;
  }
}
