import type { ChatTransport, UIMessage, UIMessageChunk } from "ai";

type FetchLike = typeof fetch;

import { fetchWithAuthRecovery } from "@/lib/chatbi-client";
import {
  CHATBI_SSE_CONTRACT_HEADER,
  CHATBI_SSE_CONTRACT_V2,
  CHATBI_UNIFIED_STREAM_API,
} from "@/lib/unified-chat/transport/constants";
import { createChatbiSseUiMessageStream } from "@/lib/unified-chat/transport/chatbiSseStream";
import { pickChatbiErrorMessage } from "@/lib/unified-chat/transport/pickChatbiErrorMessage";
import type { ChatbiStreamRequestBody } from "@/lib/unified-chat/transport/types";
import type { ChatbiSseStreamCallbacks } from "@/lib/unified-chat/transport/chatbiSseStream";

export type ChatbiSseTransportOptions = {
  api?: string;
  fetch?: FetchLike;
  /** 鉴权头等（如 Authorization）；静态快照，优先用 getHeaders */
  headers?: Record<string, string>;
  /** 每次请求读取最新头（避免 useChat 首渲固定 transport 导致 token 为空） */
  getHeaders?: () => Record<string, string>;
  callbacks?: ChatbiSseStreamCallbacks;
};

function normalizeRequestHeaders(
  headers: HeadersInit | Record<string, string> | undefined,
): Record<string, string> {
  if (!headers) return {};
  if (headers instanceof Headers) {
    const out: Record<string, string> = {};
    headers.forEach((value, key) => {
      out[key] = value;
    });
    return out;
  }
  if (Array.isArray(headers)) {
    const out: Record<string, string> = {};
    for (const pair of headers) {
      if (!Array.isArray(pair) || pair.length < 2) continue;
      const [key, value] = pair;
      if (typeof key === "string" && value !== undefined) {
        out[key] = String(value);
      }
    }
    return out;
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

function lastUserTextFromMessages(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (!m || m.role !== "user") continue;
    const parts = m.parts ?? [];
    const text = parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("");
    if (text.trim()) return text.trim();
  }
  return "";
}

function resolveStreamBody(
  optionsBody: Record<string, unknown> | undefined,
  messages: UIMessage[],
): ChatbiStreamRequestBody {
  const b = optionsBody ?? {};
  const query =
    typeof b.query === "string" && b.query.trim()
      ? b.query.trim()
      : lastUserTextFromMessages(messages);
  if (!query) {
    throw new Error("缺少 query");
  }
  const session_id = typeof b.session_id === "string" ? b.session_id : "";
  if (!session_id.trim()) {
    throw new Error("缺少 session_id");
  }
  const prefer = typeof b.prefer === "string" ? b.prefer : "auto";
  return {
    session_id: session_id.trim(),
    query,
    prefer,
    ...(b.debug_router === true ? { debug_router: true } : {}),
    ...(b.debug_llm_prompts === true ? { debug_llm_prompts: true } : {}),
    ...(typeof b.plan_execution_token === "string" && b.plan_execution_token.trim()
      ? { plan_execution_token: b.plan_execution_token.trim() }
      : {}),
  };
}

/**
 * ChatBI 增量 SSE → AI SDK `UIMessageChunk`（`text-delta` + Timeline adapter 回调）。
 */
export class ChatbiSseTransport implements ChatTransport<UIMessage> {
  private readonly api: string;
  private readonly fetchImpl: FetchLike;
  private readonly headers: Record<string, string>;
  private readonly getHeaders?: () => Record<string, string>;
  private readonly callbacks: ChatbiSseStreamCallbacks;

  constructor(options: ChatbiSseTransportOptions = {}) {
    this.api = options.api ?? CHATBI_UNIFIED_STREAM_API;
    this.fetchImpl = options.fetch ?? fetchWithAuthRecovery;
    this.headers = options.headers ?? {};
    this.getHeaders = options.getHeaders;
    this.callbacks = options.callbacks ?? {};
  }

  async sendMessages(
    options: Parameters<ChatTransport<UIMessage>["sendMessages"]>[0],
  ): Promise<ReadableStream<UIMessageChunk>> {
    const body = resolveStreamBody(
      options.body as Record<string, unknown> | undefined,
      options.messages,
    );
    const mergedHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      [CHATBI_SSE_CONTRACT_HEADER]: CHATBI_SSE_CONTRACT_V2,
      ...this.headers,
      ...(this.getHeaders?.() ?? {}),
      ...normalizeRequestHeaders(options.headers),
    };

    const res = await this.fetchImpl(this.api, {
      method: "POST",
      headers: mergedHeaders,
      credentials: "include",
      signal: options.abortSignal,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const raw = await res.text().catch(() => "");
      throw new Error(pickChatbiErrorMessage(raw, res.status, res.statusText));
    }
    if (!res.body) {
      throw new Error("SSE 响应无 body（ReadableStream 不可用）");
    }

    const initialRunId = crypto.randomUUID();
    return createChatbiSseUiMessageStream({
      sseBody: res.body,
      abortSignal: options.abortSignal,
      initialRunId,
      callbacks: this.callbacks,
    });
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}
