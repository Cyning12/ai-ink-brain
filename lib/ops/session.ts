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

export type OpsSessionDetailResponse = {
  session_id: string;
  meta: OpsSessionMeta;
  gate_summary: {
    pending: string[];
    approved: string[];
  };
  recent_messages: OpsSessionRecentMessage[];
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
