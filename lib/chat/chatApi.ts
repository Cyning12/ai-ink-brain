export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  role: ChatRole;
  content: string;
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
};

function debugLog(
  enabled: boolean,
  cb: ((line: string) => void) | undefined,
  line: string,
) {
  if (!enabled) return;
  if (cb) cb(line);
  else console.log(line);
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks += 1;
    bytes += value.byteLength;
    const text = decoder.decode(value, { stream: true });
    if (text) args.onToken(text);
  }

  const tail = decoder.decode();
  if (tail) args.onToken(tail);

  const elapsedMs = Math.max(0, Math.round(performance.now() - startedAt));
  debugLog(args.debug === true, args.onDebugLog, `[chat] chunks=${chunks} bytes=${bytes} elapsedMs=${elapsedMs}`);

  return { chunks, bytes, elapsedMs };
}

