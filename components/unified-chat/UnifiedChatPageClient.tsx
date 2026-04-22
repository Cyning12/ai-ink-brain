"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useSessionId } from "@/lib/hooks/useSessionId";
import type { ChainChatResponse, ChainEvent } from "@/components/chain-chat/types";
import { ChainTimeline } from "@/components/chain-chat/ChainTimeline";

const LS_TOKEN_KEY = "blog_admin_token";

type PreferMode = "auto" | "rag" | "text2sql";

type ChatRow = { id: string; role: "user" | "assistant"; text: string };

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

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function pickErrorMessage(raw: string, status: number, statusText: string): string {
  const t = raw.trim();
  const j = safeJson(raw);
  if (j && typeof j === "object") {
    const obj = j as { detail?: unknown; error?: unknown };
    if (typeof obj.detail === "string" && obj.detail.trim()) return obj.detail.trim();
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error.trim();
  }
  return t || `${status} ${statusText}`;
}

function extractTextFromPayload(payload: Record<string, unknown>): string {
  const direct = typeof payload.text === "string" ? payload.text : "";
  if (direct.trim()) return direct;
  const answer = typeof payload.answer === "string" ? payload.answer : "";
  if (answer.trim()) return answer;
  const output =
    payload.output && typeof payload.output === "object"
      ? (payload.output as Record<string, unknown>)
      : null;
  const outAnswer = output && typeof output.answer === "string" ? output.answer : "";
  if (outAnswer.trim()) return outAnswer;
  return "";
}

function extractMessagesFromEvents(events: ChainEvent[]): ChatRow[] {
  const out: ChatRow[] = [];
  for (const e of [...events].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))) {
    if (e.type !== "user.message" && e.type !== "assistant.message") continue;
    const text = extractTextFromPayload(e.payload);
    if (!text.trim()) continue;
    out.push({
      id: `${e.run_id}:${e.step_id}:${e.ts}:${e.type}`,
      role: e.type === "user.message" ? "user" : "assistant",
      text,
    });
  }
  return out;
}

function extractFinalAnswer(args: {
  answer?: string;
  events: ChainEvent[];
}): string {
  const direct = typeof args.answer === "string" ? args.answer : "";
  if (direct.trim()) return direct.trim();

  // 1) 最后一个 assistant.message（兼容 payload.text / payload.answer / payload.output.answer）
  const lastAssistant = [...args.events]
    .filter((e) => e.type === "assistant.message")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (lastAssistant) {
    const t = extractTextFromPayload(lastAssistant.payload);
    if (t.trim()) return t.trim();
  }

  // 2) 兜底：最后一个 tool.call.end 的 output.answer（截图里常见这种）
  const lastToolEnd = [...args.events]
    .filter((e) => e.type === "tool.call.end")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (lastToolEnd) {
    const t = extractTextFromPayload(lastToolEnd.payload);
    if (t.trim()) return t.trim();
  }

  return "";
}

export function UnifiedChatPageClient() {
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

  const { sessionId, resetSession } = useSessionId("unified-chat");

  const [prefer, setPrefer] = useState<PreferMode>("auto");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string>("");

  const messages = useMemo(() => extractMessagesFromEvents(events), [events]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 p-4 text-sm text-slate-600">
        正在加载…
      </div>
    );
  }

  const send = async (q: string) => {
    setLoading(true);
    setErrorText(null);
    setFinalAnswer("");
    try {
      const res = await fetch("/api/py/unified/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ session_id: sessionId, query: q, prefer }),
      });
      const raw = await res.text().catch(() => "");
      if (!res.ok) throw new Error(pickErrorMessage(raw, res.status, res.statusText));
      const j = safeJson(raw);
      if (!j || typeof j !== "object") throw new Error("响应不是合法 JSON");
      const data = j as ChainChatResponse;
      if (!data.ok || !Array.isArray(data.events)) {
        throw new Error(typeof data.error === "string" ? data.error : "unified chat 返回 ok=false");
      }
      setEvents(data.events);
      setFinalAnswer(extractFinalAnswer({ answer: data.answer, events: data.events }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorText(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,1.4fr,0.9fr]">
      {/* 左栏：消息 */}
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
        <div className="border-b border-[color:var(--color-border)] px-4 py-3">
          <div className="font-serif text-sm text-[#2c2c2c]">消息</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            session_id: <span className="font-mono">{sessionId}</span>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto px-4 py-4">
          {finalAnswer.trim() ? (
            <div className="mb-4 rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/90 px-3 py-2">
              <div className="text-[10px] text-slate-400">最终答案</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {finalAnswer}
              </div>
            </div>
          ) : null}
          {messages.length === 0 ? (
            <p className="text-[12px] leading-relaxed text-slate-500">
              发送一次问题后，这里会显示从 events 提取的 user/assistant 消息。
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/80 px-3 py-2"
                >
                  <div className="text-[10px] text-slate-400">{m.role}</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 中栏：Timeline */}
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
        <div className="border-b border-[color:var(--color-border)] px-4 py-3">
          <div className="font-serif text-sm text-[#2c2c2c]">Timeline</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            v1：按 ts 排序，展开查看详情（sql.result / rag.sources / latency / error）
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto px-4 py-4">
          <ChainTimeline events={events} />
        </div>
      </section>

      {/* 右栏：模式切换/推荐 */}
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
        <div className="border-b border-[color:var(--color-border)] px-4 py-3">
          <div className="font-serif text-sm text-[#2c2c2c]">控制台</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            prefer（auto/rag/text2sql）+ 推荐问法
          </div>
        </div>
        <div className="space-y-3 px-4 py-4">
          {locked ? (
            <div className="space-y-2">
              <p className="text-sm leading-relaxed text-slate-700">
                此功能仅博主可用，请输入密钥解锁。
              </p>
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
            </div>
          ) : (
            <>
              <label className="block text-[11px] text-slate-500">
                prefer
                <select
                  value={prefer}
                  onChange={(e) => setPrefer(e.target.value as PreferMode)}
                  className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                >
                  <option value="auto">auto</option>
                  <option value="rag">rag</option>
                  <option value="text2sql">text2sql</option>
                </select>
              </label>

              <div className="text-[11px] text-slate-500">推荐问法</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "统计 agent_info 表里有多少条数据",
                  "这篇日志主要讲了什么？请给出引用来源",
                  "总结一下 RRF 融合策略的核心思想",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraft(s)}
                    className="rounded-full border border-[color:var(--color-border)] bg-[#f9f9f7] px-3 py-1.5 text-[11px] text-slate-700 hover:bg-white/70"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {errorText ? (
                <p className="text-[12px] leading-relaxed text-red-600/90">
                  {errorText}
                </p>
              ) : null}

              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                placeholder="输入问题…"
              />

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetSession();
                    setEvents([]);
                    setErrorText(null);
                  }}
                  className="rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2 text-sm text-slate-700"
                >
                  新会话
                </button>
                <button
                  type="button"
                  onClick={() => void send(draft.trim())}
                  disabled={loading || !draft.trim()}
                  className="rounded-xl bg-[#2c2c2c] px-4 py-2 text-sm text-[#f9f9f7] disabled:opacity-40"
                >
                  {loading ? "…" : "发送"}
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

