export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type SourceCitation = {
  id: number;
  relativePath: string;
  filename: string;
  slug: string;
  original_link: string | null;
  category: string;
  chunk_index: number;
  snippet: string;
  fused_score: number;
};

export type ChatRetrievalInfo = {
  top_k?: number;
  rrf_k?: number;
};

export type StreamChatArgs = {
  sessionId: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
  onToken: (chunk: string) => void;
  headers: Record<string, string>;
  debug?: boolean;
  onDebugLog?: (line: string) => void;
};

export type StreamChatResult = {
  chunks: number;
  bytes: number;
  elapsedMs: number;
  answerText: string;
  sources?: SourceCitation[];
  retrieval?: ChatRetrievalInfo;
};

/** 历史接口单条消息（与后端 JSON 对齐） */
export type ChatHistoryRow = {
  role: ChatRole;
  content: string;
  created_at?: string;
};

export type ChatHistoryResponse = {
  ok: boolean;
  session_id?: string;
  messages?: ChatHistoryRow[];
  error?: string;
  error_type?: string;
};

export type FetchChatHistoryArgs = {
  sessionId: string;
  limit?: number;
  signal?: AbortSignal;
  headers: Record<string, string>;
};

function parseHistoryJson(text: string): ChatHistoryResponse {
  try {
    return JSON.parse(text) as ChatHistoryResponse;
  } catch {
    return { ok: false, error: text.slice(0, 500) || "响应非 JSON" };
  }
}

/**
 * 拉取某 session 的持久化消息，用于刷新后恢复 UI。
 */
export async function fetchChatHistory(
  args: FetchChatHistoryArgs,
): Promise<ChatHistoryResponse> {
  const sessionId = args.sessionId.trim();
  if (!sessionId) throw new Error("session_id 不能为空");

  let limit = args.limit;
  if (limit !== undefined) {
    if (!Number.isFinite(limit) || limit < 1) limit = 1;
    else if (limit > 200) limit = 200;
    else limit = Math.floor(limit);
  }

  const sp = new URLSearchParams({ session_id: sessionId });
  if (limit !== undefined) sp.set("limit", String(limit));

  const res = await fetch(`/api/py/chat/history?${sp.toString()}`, {
    method: "GET",
    headers: { ...args.headers },
    credentials: "include",
    signal: args.signal,
  });

  const raw = await res.text().catch(() => "");
  const data = parseHistoryJson(raw);

  if (res.status === 401) {
    throw new Error("未授权（401）：请配置/输入 Token 后重试");
  }

  if (!res.ok) {
    const msg =
      (typeof data.error === "string" && data.error) ||
      raw.trim() ||
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }

  if (!data.ok) {
    const msg =
      (typeof data.error === "string" && data.error) || "历史接口返回 ok=false";
    throw new Error(msg);
  }

  return data;
}

function debugLog(
  enabled: boolean,
  cb: ((line: string) => void) | undefined,
  line: string,
) {
  if (!enabled) return;
  if (cb) cb(line);
  else console.log(line);
}

const RAG_SOURCES_MARKER = "---RAG_SOURCES_JSON---";

function safeParseSourcesJson(raw: string): {
  sources?: SourceCitation[];
  retrieval?: ChatRetrievalInfo;
} {
  try {
    const parsed = JSON.parse(raw) as {
      sources?: unknown;
      retrieval?: unknown;
    };
    const sources = Array.isArray(parsed.sources)
      ? (parsed.sources as SourceCitation[])
      : undefined;
    const retrieval =
      parsed.retrieval && typeof parsed.retrieval === "object"
        ? (parsed.retrieval as ChatRetrievalInfo)
        : undefined;
    return { sources, retrieval };
  } catch {
    return {};
  }
}

export async function streamChat(args: StreamChatArgs): Promise<StreamChatResult> {
  const startedAt = performance.now();
  const sessionId = args.sessionId.trim();
  if (!sessionId) throw new Error("session_id 不能为空");

  const payload = {
    session_id: sessionId,
    messages: args.messages,
  };

  debugLog(args.debug === true, args.onDebugLog, `[chat] session_id=${sessionId}`);
  debugLog(args.debug === true, args.onDebugLog, `[chat] messages=${args.messages.length}`);

  const res = await fetch("/api/py/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...args.headers,
    },
    credentials: "include",
    body: JSON.stringify(payload),
    signal: args.signal,
  });

  if (res.status === 401) {
    throw new Error("未授权（401）：请配置/输入 Token 后重试");
  }

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    let msg = t.trim() || `${res.status} ${res.statusText}`;
    try {
      const j = JSON.parse(t) as { detail?: unknown };
      if (typeof j?.detail === "string") msg = j.detail;
      else if (Array.isArray(j.detail)) msg = j.detail.map(String).join("; ");
    } catch {
      // 保持纯文本
    }
    throw new Error(msg);
  }

  if (!res.body) throw new Error("响应无正文流");

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let chunks = 0;
  let bytes = 0;

  // 兼容后端在流末尾追加 sources JSON：保证“逐字输出”只展示回答文本，不展示分隔符/JSON。
  let answerText = "";
  let pending = "";
  let markerFound = false;
  let sourcesRaw = "";

  const emitAnswer = (text: string) => {
    if (!text) return;
    answerText += text;
    args.onToken(text);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks += 1;
    bytes += value.byteLength;
    const text = decoder.decode(value, { stream: true });
    if (!text) continue;

    if (markerFound) {
      sourcesRaw += text;
      continue;
    }

    pending += text;

    const idx = pending.indexOf(RAG_SOURCES_MARKER);
    if (idx >= 0) {
      const before = pending.slice(0, idx);
      emitAnswer(before);
      sourcesRaw += pending.slice(idx + RAG_SOURCES_MARKER.length);
      pending = "";
      markerFound = true;
      continue;
    }

    // 保留末尾以便捕捉跨 chunk 的 marker
    const keep = Math.max(0, RAG_SOURCES_MARKER.length - 1);
    if (pending.length > keep) {
      const out = pending.slice(0, pending.length - keep);
      pending = pending.slice(pending.length - keep);
      emitAnswer(out);
    }
  }

  const tail = decoder.decode();
  if (tail) {
    if (markerFound) {
      sourcesRaw += tail;
    } else {
      pending += tail;
    }
  }

  if (!markerFound) {
    emitAnswer(pending);
    pending = "";
  } else if (pending) {
    // 理论上不会进来，但保持健壮性：markerFound 时 pending 代表 marker 前残留
    emitAnswer(pending);
    pending = "";
  }

  const elapsedMs = Math.max(0, Math.round(performance.now() - startedAt));
  debugLog(args.debug === true, args.onDebugLog, `[chat] chunks=${chunks} bytes=${bytes} elapsedMs=${elapsedMs}`);

  const parsed = markerFound
    ? safeParseSourcesJson(sourcesRaw.trimStart())
    : {};
  if (markerFound && args.debug === true) {
    debugLog(
      true,
      args.onDebugLog,
      `[chat] sources_json=${parsed.sources?.length ?? 0} marker=${RAG_SOURCES_MARKER}`,
    );
  }

  return {
    chunks,
    bytes,
    elapsedMs,
    answerText,
    sources: parsed.sources,
    retrieval: parsed.retrieval,
  };
}

