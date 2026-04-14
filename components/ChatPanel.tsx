"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import type { ChatHistoryRow, ChatMessage } from "@/lib/chat/chatApi";
import { fetchChatHistory, streamChat } from "@/lib/chat/chatApi";
import { useSessionId } from "@/lib/hooks/useSessionId";
import { SourceCitations } from "@/components/SourceCitations";

const LS_TOKEN_KEY = "blog_admin_token";

type TextPart = { type: "text"; text: string };
type Source = NonNullable<Awaited<ReturnType<typeof streamChat>>["sources"]>[number];

type ChatRow = {
  id: string;
  role: "user" | "assistant";
  parts: TextPart[];
  sources?: Source[];
};

type ChatStatus = "ready" | "submitted" | "streaming";

function readToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_TOKEN_KEY)?.trim() ?? "";
}

function writeToken(token: string) {
  if (typeof window === "undefined") return;
  const t = token.trim();
  if (!t) localStorage.removeItem(LS_TOKEN_KEY);
  else localStorage.setItem(LS_TOKEN_KEY, t);
}

function messageToMarkdown(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const m = message as { content?: unknown; parts?: unknown[] };
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.parts)) {
    return m.parts
      .map((p) => {
        if (!p || typeof p !== "object") return "";
        const part = p as { type?: unknown; text?: unknown };
        return part.type === "text" && typeof part.text === "string"
          ? part.text
          : "";
      })
      .join("");
  }
  return "";
}

function mapHistoryToRows(items: ChatHistoryRow[] | undefined): ChatRow[] {
  if (!items?.length) return [];
  return items
    .filter(
      (m): m is ChatHistoryRow & { role: "user" | "assistant" } =>
        m.role === "user" || m.role === "assistant",
    )
    .map((m) => ({
      id: crypto.randomUUID(),
      role: m.role,
      parts: [
        {
          type: "text" as const,
          text: typeof m.content === "string" ? m.content : "",
        },
      ],
    }))
    .filter((row) => messageToMarkdown(row).trim().length > 0);
}

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState(() => readToken());
  const [tokenInput, setTokenInput] = useState("");
  const tokenInputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open && !token) {
      tokenInputRef.current?.focus();
    }
  }, [open, token]);

  const { sessionId, resetSession } = useSessionId("floating");
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const [debug, setDebug] = useState(false);
  const [debugLines, setDebugLines] = useState<string[]>([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const headers: Record<string, string> = useMemo(() => {
    const t = token.trim();
    return t
      ? { Authorization: `Bearer ${t}` }
      : ({} as Record<string, string>);
  }, [token]);

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [error, setError] = useState<Error | null>(null);

  const locked = !token.trim();

  // 解锁后按 session_id 拉持久化历史（刷新可恢复）；竞态与切换 session 用 ref 丢弃过期响应
  useEffect(() => {
    if (locked) {
      setHistoryReady(false);
      return;
    }

    const ac = new AbortController();
    const sidAtStart = sessionId;
    setHistoryReady(false);
    setHistoryError(null);

    void (async () => {
      try {
        const data = await fetchChatHistory({
          sessionId: sidAtStart,
          headers,
          signal: ac.signal,
        });
        if (ac.signal.aborted || sessionIdRef.current !== sidAtStart) return;
        setMessages(mapHistoryToRows(data.messages));
      } catch (e) {
        if (ac.signal.aborted) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (sessionIdRef.current !== sidAtStart) return;
        const msg = e instanceof Error ? e.message : String(e);
        setHistoryError(msg);
        setMessages([]);
      } finally {
        if (!ac.signal.aborted && sessionIdRef.current === sidAtStart) {
          setHistoryReady(true);
        }
      }
    })();

    return () => ac.abort();
  }, [locked, sessionId, headers]);

  const onDebugLog = useCallback((line: string) => {
    setDebugLines((prev) => {
      const next = [...prev, line];
      return next.length > 80 ? next.slice(next.length - 80) : next;
    });
  }, []);

  const uiToApiMessages = useCallback((history: ChatRow[]): ChatMessage[] => {
    return history
      .map((m) => ({
        role: m.role,
        content: messageToMarkdown(m),
      }))
      .filter((m) => m.content.trim().length > 0);
  }, []);

  const streamPyChat = useCallback(
    async (history: ChatRow[], assistantId: string, signal: AbortSignal) => {
      setError(null);
      setStatus("submitted");
      setDebugLines([]);
      try {
        setStatus("streaming");
        let acc = "";
        const apiMessages = uiToApiMessages(history);
        const result = await streamChat({
          sessionId,
          messages: apiMessages,
          headers,
          signal,
          debug,
          onDebugLog,
          onToken(chunk) {
            acc += chunk;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, parts: [{ type: "text", text: acc }] }
                  : m,
              ),
            );
          },
        });
        if (result.sources?.length) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, sources: result.sources } : m,
            ),
          );
        }
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        setError(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && messageToMarkdown(m) === ""
              ? { ...m, parts: [{ type: "text", text: `（请求失败）\n${err.message}` }] }
              : m,
          ),
        );
      } finally {
        setStatus("ready");
      }
    },
    [debug, headers, onDebugLog, sessionId, uiToApiMessages],
  );

  const isLoading = status === "streaming" || status === "submitted";

  const [snippetOpen, setSnippetOpen] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetText, setSnippetText] = useState("");
  const [snippetMeta, setSnippetMeta] = useState("");

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex items-end justify-end">
      {/* 右下角按钮 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full border border-[color:var(--color-border)] bg-[#f9f9f7]/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-[color:var(--color-wash)]/70"
        aria-label={open ? "关闭聊天" : "打开聊天"}
        title={open ? "关闭" : "对话"}
      >
        {/* 墨水瓶/毛笔：极简 SVG */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#2c2c2c]"
        >
          <path
            d="M9 3h6l1 6c.2 1.2-.3 2.4-1.2 3.1L12 14l-2.8-1.9C8.3 11.4 7.8 10.2 8 9l1-6Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M12 14v7c0 0 4-1 4-4 0-1.6-1.1-2.5-2-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M12 14v7c0 0-4-1-4-4 0-1.6 1.1-2.5 2-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* 侧边栏小窗 */}
      {open && (
        <aside className="pointer-events-auto ml-3 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3">
            <div className="min-w-0">
              <div className="truncate font-serif text-sm text-[#2c2c2c]">
                Cyning · Chat
              </div>
              <div className="mt-0.5 text-[11px] text-slate-500">RAG</div>
            </div>
            <div className="flex items-center gap-2">
              {!locked && (
                <button
                  type="button"
                  onClick={() => {
                    abortRef.current?.abort();
                    abortRef.current = null;
                    writeToken("");
                    setToken("");
                    setTokenInput("");
                    setMessages([]);
                    setDebugLines([]);
                  }}
                  className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[11px] text-slate-600 hover:bg-[color:var(--color-wash)]/70"
                  title="清除本地密钥并清空对话"
                >
                  Lock
                </button>
              )}
              {!locked && (
                <button
                  type="button"
                  onClick={() => {
                    abortRef.current?.abort();
                    abortRef.current = null;
                    resetSession();
                    setMessages([]);
                    setDebugLines([]);
                    setError(null);
                  }}
                  className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[11px] text-slate-600 hover:bg-[color:var(--color-wash)]/70"
                  title="生成新的 session_id，并清空对话"
                >
                  新会话
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[11px] text-slate-600 hover:bg-[color:var(--color-wash)]/70"
              >
                关闭
              </button>
            </div>
          </div>

          {/* 未解锁提示 */}
          {locked ? (
            <div className="space-y-3 px-4 py-4">
              <p className="text-sm leading-relaxed text-slate-700">
                此功能仅博主可用，请输入密钥解锁。
              </p>
              <div className="space-y-2">
                <label className="block text-[11px] text-slate-500">
                  Token（NEXT_PUBLIC_ADMIN_SECRET）
                  <input
                    ref={tokenInputRef}
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                    placeholder="输入后本地存储"
                    autoComplete="off"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const t = tokenInput.trim();
                    writeToken(t);
                    setToken(t);
                  }}
                  className="w-full rounded-xl bg-[#2c2c2c] px-3 py-2 text-sm text-[#f9f9f7] hover:opacity-90"
                >
                  解锁
                </button>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  提示：该 Token 会以明文存于
                  localStorage（仅适合个人私用环境）。
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* 消息列表 */}
              <div className="h-[420px] overflow-y-auto px-4 py-4">
                <div className="space-y-5">
                  {!historyReady && (
                    <p className="text-[12px] leading-relaxed text-slate-500">
                      正在加载历史…
                    </p>
                  )}

                  {historyReady && messages.length === 0 && (
                    <p className="text-[12px] leading-relaxed text-slate-500">
                      请输入问题，我会基于已入库的内容检索并回答。
                    </p>
                  )}

                  {historyError && (
                    <p className="text-[12px] leading-relaxed text-red-600/90">
                      历史加载失败：{historyError}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-3 text-[10px] text-slate-500">
                    <div className="min-w-0 truncate">
                      session_id: <span className="font-mono">{sessionId}</span>
                    </div>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={debug}
                        onChange={(e) => setDebug(e.target.checked)}
                      />
                      debug
                    </label>
                  </div>

                  {messages.map((m) => {
                    const isUser = m.role === "user";
                    const content = messageToMarkdown(m);
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[88%] space-y-1.5 ${isUser ? "text-right" : "text-left"}`}
                        >
                          <div className="text-[10px] tracking-wide text-slate-400">
                            {isUser ? "你" : "Cyning"}
                          </div>

                          {/* “气泡”不用底色，用细黑线区分 */}
                          <div
                            className={`rounded-2xl px-3 py-2 text-sm leading-relaxed text-[#2c2c2c] ${
                              isUser
                                ? "border-r-2 border-[#2c2c2c]/80"
                                : "border-l-2 border-[#2c2c2c]/80"
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {content}
                            </ReactMarkdown>
                          </div>

                          {!isUser && m.sources?.length ? (
                            <SourceCitations
                              sources={m.sources}
                              onOpenSnippet={(s) => {
                                const title =
                                  s.filename ||
                                  s.path ||
                                  s.relativePath ||
                                  `source#${String(s.id)}`;
                                const metaParts = [
                                  s.category ? `category=${s.category}` : "",
                                  s.slug ? `slug=${s.slug}` : "",
                                  typeof s.chunk_index === "number"
                                    ? `chunk=${s.chunk_index}`
                                    : "",
                                  (s.path || s.relativePath)
                                    ? `path=${String(s.path || s.relativePath)}`
                                    : "",
                                ].filter(Boolean);
                                setSnippetTitle(title);
                                setSnippetMeta(metaParts.join(" · "));
                                const txt = (s.content || s.snippet || "").trim();
                                setSnippetText(txt || "（无摘要）");
                                setSnippetOpen(true);
                              }}
                            />
                          ) : null}
                        </div>
                      </div>
                    );
                  })}

                  {error && (
                    <p className="text-[12px] text-red-600/90">
                      请求失败：{String(error.message || error)}
                    </p>
                  )}

                  {debug && debugLines.length > 0 && (
                    <div className="rounded-xl border border-[color:var(--color-border)] bg-white/40 p-2">
                      <div className="mb-1 text-[10px] text-slate-500">debug logs</div>
                      <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-words text-[10px] leading-relaxed text-slate-600">
                        {debugLines.join("\n")}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              {/* 摘要预览弹层（无 original_link 时使用） */}
              {snippetOpen && (
                <div className="pointer-events-auto fixed inset-0 z-[70] grid place-items-center bg-black/20 px-4">
                  <div className="w-full max-w-[560px] rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7] p-4 shadow-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-serif text-sm text-[#2c2c2c]">
                          {snippetTitle}
                        </div>
                        {snippetMeta && (
                          <div className="mt-0.5 truncate text-[11px] text-slate-500">
                            {snippetMeta}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSnippetOpen(false)}
                        className="shrink-0 rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[11px] text-slate-600 hover:bg-white/60"
                      >
                        关闭
                      </button>
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-[12px] leading-relaxed text-slate-700">
                      {snippetText}
                    </div>
                  </div>
                </div>
              )}

              {/* 输入区 */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = draft.trim();
                  if (!text || isLoading || !historyReady) return;
                  setDraft("");
                  abortRef.current?.abort();
                  const controller = new AbortController();
                  abortRef.current = controller;
                  const userMsg: ChatRow = {
                    id: crypto.randomUUID(),
                    role: "user",
                    parts: [{ type: "text", text }],
                  };
                  const assistantId = crypto.randomUUID();
                  const assistantMsg: ChatRow = {
                    id: assistantId,
                    role: "assistant",
                    parts: [{ type: "text", text: "" }],
                  };
                  const history = [...messages, userMsg];
                  setMessages((m) => [...m, userMsg, assistantMsg]);
                  void streamPyChat(history, assistantId, controller.signal);
                }}
                className="border-t border-[color:var(--color-border)] px-4 py-3"
              >
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={2}
                    className="min-h-[42px] flex-1 resize-none rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                    placeholder="问点什么…（Shift+Enter 换行）"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      abortRef.current?.abort();
                      abortRef.current = null;
                      setStatus("ready");
                      onDebugLog("[chat] aborted by user");
                    }}
                    disabled={!isLoading}
                    className="rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2 text-sm text-slate-700 disabled:opacity-40"
                    title="停止生成"
                  >
                    停止
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !draft.trim() || !historyReady}
                    className="rounded-xl bg-[#2c2c2c] px-4 py-2 text-sm text-[#f9f9f7] disabled:opacity-40"
                  >
                    {isLoading ? "…" : "发送"}
                  </button>
                </div>
              </form>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
