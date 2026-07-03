"use client";

import type { OpsChatMessagesResponse, OpsRunEvent } from "@/lib/ops/chat";

export type OpsSessionMeta = {
  schema_version: string;
  session_id: string;
  slug: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  latest_run_id?: string | null;
  gate_summary?: {
    pending: string[];
    approved: string[];
  };
};

export type OpsSessionListResponse = {
  items: OpsSessionMeta[];
  total: number;
  limit: number;
  offset: number;
};

export type OpsSessionDeliverableFile = {
  name: string;
  path: string;
  type?: string | null;
  route?: string | null;
};

export type OpsSessionDeliverable = {
  run_id: string;
  path: string;
  type?: string | null;
  route?: string | null;
  files?: OpsSessionDeliverableFile[];
};

export type OpsSessionDetailResponse = {
  session_id: string;
  meta: OpsSessionMeta;
  gate_summary: {
    pending: string[];
    approved: string[];
  };
  recent_messages: OpsSessionRecentMessage[];
  deliverables?: OpsSessionDeliverable[];
};

export type OpsSessionDeliverablesResponse = {
  session_id: string;
  items: OpsSessionDeliverable[];
};

export type OpsSessionRecentMessage = {
  run_id: string;
  role: string;
  content_preview: string;
  answer_preview?: string | null;
  route?: string;
  status?: string;
  created_at?: string;
};

export function serializeOpsSessionRecentMessage(msg: OpsSessionRecentMessage): string {
  const lines = [`run_id: ${msg.run_id}`, `user: ${msg.content_preview}`];
  if (msg.route) lines.push(`route: ${msg.route}`);
  if (msg.answer_preview) lines.push(`assistant: ${msg.answer_preview}`);
  return lines.join("\n");
}

export function serializeOpsSessionRecentMessages(messages: OpsSessionRecentMessage[]): string {
  return messages.map(serializeOpsSessionRecentMessage).join("\n\n---\n\n");
}

export type OpsSessionCreateResponse = {
  session_id: string;
  meta: OpsSessionMeta;
};

export type OpsSessionEventsResponse = {
  session_id: string;
  after_seq: number;
  events: OpsRunEvent[];
};

export type OpsSessionSendResult =
  | { ok: true; data: OpsChatMessagesResponse & { session_id: string; awaiting_auth?: boolean; plan_summary?: string } }
  | { ok: false; error: string };

export type OpsSessionAuthAction = "approve" | "revise" | "cancel";

export type OpsSessionAuthResult =
  | {
      ok: true;
      data: {
        session_id: string;
        action: OpsSessionAuthAction;
        status: string;
        message?: string;
        answer?: string;
        idempotent?: boolean;
        gate_summary?: { pending: string[]; approved: string[] };
      };
    }
  | { ok: false; error: string };

export async function fetchOpsSessions(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<OpsSessionListResponse | null> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.limit != null) qs.set("limit", String(params.limit));
  if (params?.offset != null) qs.set("offset", String(params.offset));
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  const res = await fetch(`/api/ops/sessions${suffix}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function createOpsSession(body: {
  slug: string;
  title: string;
}): Promise<OpsSessionCreateResponse | null> {
  const res = await fetch("/api/ops/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function fetchOpsSession(sessionId: string): Promise<OpsSessionDetailResponse | null> {
  const res = await fetch(`/api/ops/sessions/${encodeURIComponent(sessionId)}`);
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function sendOpsSessionMessage(
  sessionId: string,
  message: string,
  model?: string,
): Promise<OpsSessionSendResult> {
  const body: { message: string; model?: string } = { message: message.trim() };
  if (model?.trim()) body.model = model.trim();

  const res = await fetch(`/api/ops/sessions/${encodeURIComponent(sessionId)}/messages`, {
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

  return { ok: true, data: data as OpsChatMessagesResponse & { session_id: string } };
}

export async function postOpsSessionAuth(
  sessionId: string,
  action: OpsSessionAuthAction,
): Promise<OpsSessionAuthResult> {
  const res = await fetch(`/api/ops/sessions/${encodeURIComponent(sessionId)}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const text = await res.text().catch(() => "");
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!res.ok) {
    let err = `${res.status} ${res.statusText}`;
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      if (typeof record.error === "string") err = record.error;
      else if (typeof record.detail === "object" && record.detail !== null) {
        const detail = record.detail as Record<string, unknown>;
        if (typeof detail.message === "string") err = detail.message;
      }
    }
    return { ok: false, error: err };
  }

  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "BFF 返回格式异常" };
  }

  return {
    ok: true,
    data: data as Extract<OpsSessionAuthResult, { ok: true }>["data"],
  };
}

export type OpsSessionTargetRepo = "ai-ink-brain-api-python" | "ai-ink-brain";

export type ConflictAction = "block" | "overwrite" | "merge";

export type OpsSessionPromoteDiffField = {
  field: string;
  source: string;
  target: string;
};

export type OpsSessionPromoteDiffSummary = {
  source_lines: number;
  target_lines: number;
  added: string[];
  removed: string[];
  changed: OpsSessionPromoteDiffField[];
};

export type OpsSessionPromoteMergeDraft = {
  path: string;
  content: string;
};

export type OpsSessionPromotePreview = {
  session_id: string;
  source_task_path: string;
  target_repo: string;
  target_branch: string;
  target_task_path: string;
  target_exists: boolean;
  conflict: boolean;
  conflict_action?: ConflictAction;
  diff_summary?: OpsSessionPromoteDiffSummary;
  merge_draft?: OpsSessionPromoteMergeDraft;
  gate_summary: { pending: string[]; approved: string[] };
  probe_available: boolean;
  verify_hint?: string;
  slug?: string;
  title?: string;
};

export type OpsSessionPromoteResult = {
  session_id: string;
  status: string;
  target_repo: string;
  target_branch: string;
  target_task_path: string;
  verify_passed: boolean;
  conflict_action?: ConflictAction;
  merge_draft_path?: string;
  verify_report?: Record<string, unknown>;
  gate_summary?: { pending: string[]; approved: string[] };
  message?: string;
};

function parseOpsApiError(data: unknown, fallback: string): string {
  if (typeof data !== "object" || data === null) return fallback;
  const record = data as Record<string, unknown>;
  if (typeof record.error === "string") return record.error;
  if (typeof record.detail === "object" && record.detail !== null) {
    const detail = record.detail as Record<string, unknown>;
    const code = typeof detail.code === "string" ? detail.code : "";
    const message = typeof detail.message === "string" ? detail.message : "";
    if (code && message) return `${code}: ${message}`;
    if (message) return message;
  }
  return fallback;
}

export async function fetchOpsSessionPromotePreview(
  sessionId: string,
  targetRepo: OpsSessionTargetRepo,
  targetBranch: string,
): Promise<OpsSessionPromotePreview | null> {
  const qs = new URLSearchParams({
    target_repo: targetRepo,
    target_branch: targetBranch,
  });
  const res = await fetch(
    `/api/ops/sessions/${encodeURIComponent(sessionId)}/promote/preview?${qs.toString()}`,
  );
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export type OpsSessionPromotePostResult =
  | { ok: true; data: OpsSessionPromoteResult }
  | { ok: false; error: string; verifyReport?: Record<string, unknown> };

function extractVerifyReport(data: unknown): Record<string, unknown> | undefined {
  if (typeof data !== "object" || data === null) return undefined;
  const record = data as Record<string, unknown>;
  if (typeof record.detail === "object" && record.detail !== null) {
    const detail = record.detail as Record<string, unknown>;
    if (typeof detail.verify_report === "object" && detail.verify_report !== null) {
      return detail.verify_report as Record<string, unknown>;
    }
  }
  if (typeof record.verify_report === "object" && record.verify_report !== null) {
    return record.verify_report as Record<string, unknown>;
  }
  return undefined;
}

export async function postOpsSessionPromote(
  sessionId: string,
  body: {
    target_repo: OpsSessionTargetRepo;
    target_branch: string;
    confirm: boolean;
    conflict_action?: ConflictAction;
  },
): Promise<OpsSessionPromotePostResult> {
  const res = await fetch(`/api/ops/sessions/${encodeURIComponent(sessionId)}/promote`, {
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
    return {
      ok: false,
      error: parseOpsApiError(data, `${res.status} ${res.statusText}`),
      verifyReport: extractVerifyReport(data),
    };
  }
  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "BFF 返回格式异常" };
  }
  return { ok: true, data: data as OpsSessionPromoteResult };
}

export type OpsSessionGraphPromoteFile = {
  name: string;
  source_path: string;
  target_path: string;
  exists: boolean;
};

export type OpsSessionGraphPromoteDiff = {
  path: string;
  source_lines: number;
  target_lines: number;
  added: string[];
  removed: string[];
  changed: string[];
};

export type OpsSessionGraphPromotePreview = {
  session_id: string;
  target_repo: string;
  target_branch: string;
  source_dir: string;
  target_dir: string;
  files: OpsSessionGraphPromoteFile[];
  diff_summary: OpsSessionGraphPromoteDiff[];
  conflict: boolean;
  conflict_action?: ConflictAction;
  gate_summary: { pending: string[]; approved: string[] };
  empty: boolean;
};

export type OpsSessionGraphPromoteResult = {
  session_id: string;
  status: string;
  target_repo: string;
  target_branch: string;
  copied_files: string[];
  conflict_action?: ConflictAction;
  gate_summary?: { pending: string[]; approved: string[] };
  message?: string;
};

export async function fetchOpsSessionGraphPromotePreview(
  sessionId: string,
  targetRepo: OpsSessionTargetRepo,
  targetBranch: string,
): Promise<OpsSessionGraphPromotePreview | null> {
  const qs = new URLSearchParams({
    target_repo: targetRepo,
    target_branch: targetBranch,
  });
  const res = await fetch(
    `/api/ops/sessions/${encodeURIComponent(sessionId)}/promote/graph?${qs.toString()}`,
  );
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export type OpsSessionGraphPromotePostResult =
  | { ok: true; data: OpsSessionGraphPromoteResult }
  | { ok: false; error: string };

export async function postOpsSessionGraphPromote(
  sessionId: string,
  body: {
    target_repo: OpsSessionTargetRepo;
    target_branch: string;
    confirm: boolean;
    conflict_action?: ConflictAction;
  },
): Promise<OpsSessionGraphPromotePostResult> {
  const res = await fetch(`/api/ops/sessions/${encodeURIComponent(sessionId)}/promote/graph`, {
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
    return {
      ok: false,
      error: parseOpsApiError(data, `${res.status} ${res.statusText}`),
    };
  }
  if (typeof data !== "object" || data === null) {
    return { ok: false, error: "BFF 返回格式异常" };
  }
  return { ok: true, data: data as OpsSessionGraphPromoteResult };
}

export async function fetchOpsSessionDeliverables(
  sessionId: string,
): Promise<OpsSessionDeliverablesResponse | null> {
  const res = await fetch(
    `/api/ops/sessions/${encodeURIComponent(sessionId)}/deliverables`,
  );
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

export async function fetchOpsSessionEvents(
  sessionId: string,
  afterSeq = 0,
): Promise<OpsSessionEventsResponse | null> {
  const res = await fetch(
    `/api/ops/sessions/${encodeURIComponent(sessionId)}/events?after_seq=${encodeURIComponent(String(afterSeq))}`,
  );
  if (!res.ok) return null;
  return res.json().catch(() => null);
}
