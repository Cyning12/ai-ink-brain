"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useSessionId } from "@/lib/hooks/useSessionId";

const LS_TOKEN_KEY = "blog_admin_token";

type RetrievedItem = {
  doc_type: "ddl" | "example";
  title: string;
  content: string;
  score: number;
};

type Text2SqlErrors = {
  generate_sql: string | null;
  execute_sql: string | null;
  summarize: string | null;
};

type Text2SqlResponseOk = {
  ok: true;
  mode: "text2sql" | "non_text2sql";
  answer: string;
  sql: string;
  columns: string[];
  rows: Array<Record<string, unknown>>;
  retrieved: RetrievedItem[];
  errors: Text2SqlErrors;
};

type Text2SqlResponse = Text2SqlResponseOk | { ok: false; error?: string };

type ChatRow =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string; debug?: Text2SqlResponseOk };

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

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function pickErrorMessage(raw: string, status: number, statusText: string): string {
  const t = raw.trim();
  const j = safeJsonParse(raw);
  if (j && typeof j === "object") {
    const obj = j as { detail?: unknown; error?: unknown };
    if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail.trim();
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim();
  }
  return t || `${status} ${statusText}`;
}

export function Text2SqlChatPanel() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const tokenInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setToken(readToken());
  }, []);

  useEffect(() => {
    if (mounted && !token) tokenInputRef.current?.focus();
  }, [mounted, token]);

  const locked = !token.trim();

  const headers: Record<string, string> = useMemo(() => {
    const t = token.trim();
    return t ? { Authorization: `Bearer ${t}` } : ({} as Record<string, string>);
  }, [token]);

  const { sessionId, resetSession } = useSessionId("text2sql");

  const [debugOpen, setDebugOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [rows, setRows] = useState<ChatRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!mounted) {
    return (
      <div className="w-full rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 px-4 py-6 text-sm text-slate-600">
        正在加载…
      </div>
    );
  }

  return (
    <div className="w-full">
      <aside className="w-full rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-4 py-3">
          <div className="min-w-0">
            <div className="truncate font-serif text-sm text-[#2c2c2c]">
              Text2SQL · Chat
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              session_id: <span className="font-mono">{sessionId}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!locked && (
              <button
                type="button"
                onClick={() => setDebugOpen((v) => !v)}
                className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[11px] text-slate-600 hover:bg-[color:var(--color-wash)]/70"
                title="展开/折叠调试信息"
              >
                Debug
              </button>
            )}
            {!locked && (
              <button
                type="button"
                onClick={() => {
                  writeToken("");
                  setToken("");
                  setTokenInput("");
                  setRows([]);
                  setErrorText(null);
                }}
                className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[11px] text-slate-600 hover:bg-[color:var(--color-wash)]/70"
                title="清除本地密钥并清空"
              >
                Lock
              </button>
            )}
            {!locked && (
              <button
                type="button"
                onClick={() => {
                  resetSession();
                  setRows([]);
                  setErrorText(null);
                }}
                className="rounded-full border border-[color:var(--color-border)] px-2.5 py-1 text-[11px] text-slate-600 hover:bg-[color:var(--color-wash)]/70"
                title="新会话"
              >
                新会话
              </button>
            )}
          </div>
        </div>

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
                提示：该 Token 会以明文存于 localStorage（仅适合个人私用环境）。
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 py-4">
              {rows.length === 0 ? (
                <p className="text-[12px] leading-relaxed text-slate-500">
                  输入一个“查库类问题”（例如统计、汇总、TopN 等），后端会返回 SQL、rows 和自然语言总结。
                </p>
              ) : null}

              <div className="mt-4 space-y-5">
                {rows.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[92%] space-y-1.5 ${isUser ? "text-right" : "text-left"}`}
                      >
                        <div className="text-[10px] tracking-wide text-slate-400">
                          {isUser ? "你" : "Text2SQL"}
                        </div>
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm leading-relaxed text-[#2c2c2c] ${
                            isUser
                              ? "border-r-2 border-[#2c2c2c]/80"
                              : "border-l-2 border-[#2c2c2c]/80"
                          }`}
                        >
                          {m.text}
                        </div>

                        {!isUser && debugOpen && m.debug ? (
                          <div className="rounded-xl border border-[color:var(--color-border)] bg-white/40 p-3 text-[11px] leading-relaxed text-slate-700">
                            <div className="font-mono text-[10px] text-slate-500">
                              mode={m.debug.mode}
                            </div>
                            <div className="mt-2">
                              <div className="text-[10px] text-slate-500">sql</div>
                              <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                                {m.debug.sql || "（空）"}
                              </pre>
                            </div>

                            <div className="mt-3">
                              <div className="text-[10px] text-slate-500">
                                rows（最多 20 行）
                              </div>
                              <pre className="mt-1 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                                {JSON.stringify(m.debug.rows.slice(0, 20), null, 2)}
                              </pre>
                            </div>

                            <div className="mt-3">
                              <div className="text-[10px] text-slate-500">
                                retrieved（title + score）
                              </div>
                              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                                {JSON.stringify(
                                  m.debug.retrieved.map((r) => ({
                                    doc_type: r.doc_type,
                                    title: r.title,
                                    score: r.score,
                                    content: r.content.slice(0, 200),
                                  })),
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>

                            {(m.debug.errors.generate_sql ||
                              m.debug.errors.execute_sql ||
                              m.debug.errors.summarize) && (
                              <div className="mt-3">
                                <div className="text-[10px] text-slate-500">
                                  errors
                                </div>
                                <pre className="mt-1 overflow-auto whitespace-pre-wrap break-words rounded-lg border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-red-700/90">
                                  {JSON.stringify(m.debug.errors, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {errorText ? (
                <p className="mt-4 text-[12px] leading-relaxed text-red-600/90">
                  请求失败：{errorText}
                </p>
              ) : null}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = draft.trim();
                if (!q || loading) return;
                setErrorText(null);
                setDraft("");
                const userRow: ChatRow = {
                  id: crypto.randomUUID(),
                  role: "user",
                  text: q,
                };
                const assistantId = crypto.randomUUID();
                setRows((prev) => [
                  ...prev,
                  userRow,
                  { id: assistantId, role: "assistant", text: "…" },
                ]);

                setLoading(true);
                void (async () => {
                  try {
                    const res = await fetch("/api/py/text2sql/chat", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        ...headers,
                      },
                      credentials: "include",
                      body: JSON.stringify({ session_id: sessionId, query: q }),
                    });
                    const raw = await res.text().catch(() => "");
                    if (!res.ok) {
                      throw new Error(
                        pickErrorMessage(raw, res.status, res.statusText),
                      );
                    }
                    const json = safeJsonParse(raw) as Text2SqlResponse | null;
                    if (!json || typeof json !== "object") {
                      throw new Error("响应不是合法 JSON");
                    }
                    if ((json as { ok?: unknown }).ok !== true) {
                      const msg =
                        (json as { error?: unknown }).error &&
                        typeof (json as { error?: unknown }).error === "string"
                          ? String((json as { error?: unknown }).error)
                          : raw.slice(0, 200) || "Text2SQL 返回 ok=false";
                      throw new Error(msg);
                    }
                    const ok = json as Text2SqlResponseOk;
                    const answer =
                      ok.mode === "non_text2sql"
                        ? `${ok.answer}\n\n（提示：该问题不像结构化查数问题，可换一种问法或改用 /chat。）`
                        : ok.answer;
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === assistantId
                          ? { id: assistantId, role: "assistant", text: answer, debug: ok }
                          : r,
                      ),
                    );
                  } catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    setErrorText(msg);
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === assistantId
                          ? { id: assistantId, role: "assistant", text: `（请求失败）\n${msg}` }
                          : r,
                      ),
                    );
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              className="border-t border-[color:var(--color-border)] px-4 py-3"
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  className="min-h-[42px] flex-1 resize-none rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                  placeholder="例如：统计 agent_info 表里有多少条数据"
                />
                <button
                  type="submit"
                  disabled={loading || !draft.trim()}
                  className="rounded-xl bg-[#2c2c2c] px-4 py-2 text-sm text-[#f9f9f7] disabled:opacity-40"
                >
                  {loading ? "…" : "发送"}
                </button>
              </div>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}

