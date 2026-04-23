"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useSessionId } from "@/lib/hooks/useSessionId";
import type { ChainChatResponse, ChainEvent } from "@/components/chain-chat/types";
import { ChainTimeline } from "@/components/chain-chat/ChainTimeline";

const LS_TOKEN_KEY = "blog_admin_token";

type ChatRow =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string };

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

function extractFinalAnswer(args: {
  answer?: string;
  events: ChainEvent[];
}): string {
  const direct = typeof args.answer === "string" ? args.answer : "";
  if (direct.trim()) return direct.trim();

  const lastAssistant = [...args.events]
    .filter((e) => e.type === "assistant.message")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (lastAssistant) {
    const t = extractTextFromPayload(lastAssistant.payload);
    if (t.trim()) return t.trim();
  }

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

function nowMs(): number {
  return Date.now();
}

function buildRunId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `run_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

/**
 * 临时兼容：若后端尚未提供 events[]，允许前端把 Text2SQL v1 JSON 映射为 timeline 事件。
 */
function mapText2SqlToEvents(args: {
  runId: string;
  query: string;
  response: Record<string, unknown>;
}): { events: ChainEvent[]; answerText: string } {
  const { runId, response } = args;
  const ts0 = nowMs();
  const answer = typeof response.answer === "string" ? response.answer : "";
  const sql = typeof response.sql === "string" ? response.sql : "";
  const columns = Array.isArray(response.columns) ? (response.columns as string[]) : [];
  const rows = Array.isArray(response.rows)
    ? (response.rows as Array<Record<string, unknown>>)
    : [];
  const errors =
    response.errors && typeof response.errors === "object"
      ? (response.errors as Record<string, unknown>)
      : {};

  const events: ChainEvent[] = [
    {
      type: "tool.call.start",
      ts: ts0,
      run_id: runId,
      step_id: "t1",
      payload: { tool: "text2sql.generate_sql" },
    },
    {
      type: "tool.call.end",
      ts: ts0 + 10,
      run_id: runId,
      step_id: "t1",
      payload: { tool: "text2sql.generate_sql", sql, error: errors["generate_sql"] ?? null },
    },
    {
      type: "tool.call.start",
      ts: ts0 + 20,
      run_id: runId,
      step_id: "t2",
      payload: { tool: "text2sql.execute_sql" },
    },
    {
      type: "sql.result",
      ts: ts0 + 30,
      run_id: runId,
      step_id: "t2",
      payload: { sql, columns, rows: rows.slice(0, 20), error: errors["execute_sql"] ?? null },
    },
    {
      type: "tool.call.end",
      ts: ts0 + 40,
      run_id: runId,
      step_id: "t2",
      payload: { tool: "text2sql.execute_sql", row_count: rows.length, error: errors["execute_sql"] ?? null },
    },
    {
      type: "assistant.message",
      ts: ts0 + 50,
      run_id: runId,
      step_id: "a1",
      payload: { text: answer },
    },
  ];

  const errMsg =
    (typeof errors["generate_sql"] === "string" && errors["generate_sql"]) ||
    (typeof errors["execute_sql"] === "string" && errors["execute_sql"]) ||
    (typeof errors["summarize"] === "string" && errors["summarize"]) ||
    "";
  if (errMsg) {
    events.push({
      type: "error",
      ts: ts0 + 60,
      run_id: runId,
      step_id: "e1",
      payload: { message: errMsg },
    });
  }

  return { events, answerText: answer };
}

export function ChainChatPageClient() {
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

  const { sessionId, resetSession } = useSessionId("chain-chat");

  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [finalAnswer, setFinalAnswer] = useState<string>("");

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

    const runId = buildRunId();
    const userMsg: ChatRow = { id: crypto.randomUUID(), role: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);

    // 1) 优先尝试后端 chain events 接口
    try {
      const res = await fetch("/api/py/chain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ session_id: sessionId, query: q }),
      });
      const raw = await res.text().catch(() => "");
      if (res.ok) {
        const j = safeJson(raw);
        if (j && typeof j === "object") {
          const data = j as ChainChatResponse;
          if (data.ok && Array.isArray(data.events)) {
            setEvents(data.events);
            const answerText = extractFinalAnswer({ answer: data.answer, events: data.events });
            if (answerText.trim()) setFinalAnswer(answerText);
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "assistant",
                text: answerText.trim() ? answerText : "（无回答）",
              },
            ]);
            setLoading(false);
            return;
          }
        }
      }
      // chain 不可用时走 fallback
      if (!res.ok) {
        // 仅用于 debug：不直接抛，让 fallback 接管
        console.log("[chain-chat] chain endpoint not ok:", raw.slice(0, 200));
      }
    } catch (e) {
      console.log("[chain-chat] chain endpoint fetch failed:", String(e));
    }

    // 2) fallback：用 Text2SQL JSON 生成 timeline 事件
    try {
      const res = await fetch("/api/py/text2sql/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        body: JSON.stringify({ session_id: sessionId, query: q }),
      });
      const raw = await res.text().catch(() => "");
      if (!res.ok) throw new Error(pickErrorMessage(raw, res.status, res.statusText));
      const j = safeJson(raw);
      if (!j || typeof j !== "object") throw new Error("Text2SQL 响应不是合法 JSON");
      const obj = j as Record<string, unknown>;
      if (obj.ok !== true) {
        throw new Error(typeof obj.error === "string" ? obj.error : "Text2SQL 返回 ok=false");
      }

      const mapped = mapText2SqlToEvents({ runId, query: q, response: obj });
      setEvents(mapped.events);
      setFinalAnswer(mapped.answerText || "");
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: mapped.answerText || "（无回答）" },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorText(msg);
      setFinalAnswer("");
      setEvents([
        {
          type: "error",
          ts: nowMs(),
          run_id: runId,
          step_id: "e1",
          payload: { message: msg },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,1.4fr,0.9fr]">
      {/* 左栏：消息流 */}
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
              左侧显示自然语言对话；中间显示 chain 事件时间线。
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/80 px-3 py-2">
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
          <div className="font-serif text-sm text-[#2c2c2c]">Chain Timeline</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            v1：按时间顺序展示 message / tool / sql / error
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto px-4 py-4">
          <ChainTimeline events={events} />
        </div>
      </section>

      {/* 右栏：工具与推荐（v1 简化） */}
      <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
        <div className="border-b border-[color:var(--color-border)] px-4 py-3">
          <div className="font-serif text-sm text-[#2c2c2c]">控制台</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            工具开关/推荐问法（v1 简化）
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
              <div className="text-[11px] text-slate-500">
                推荐问法
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "统计 agent_info 表里有多少条数据",
                  "按日期统计订单数量（最近 7 天）",
                  "Top5 用户的订单金额",
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

              <div className="pt-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                  placeholder="输入问题…"
                />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetSession();
                      setMessages([]);
                      setEvents([]);
                      setErrorText(null);
                    }}
                    className="rounded-xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2 text-sm text-slate-700"
                    title="新会话"
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
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

