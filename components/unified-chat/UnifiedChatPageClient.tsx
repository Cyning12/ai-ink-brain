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

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
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

type SseBlock = { event: string; data: string };

function parseSseBlocks(chunkText: string): SseBlock[] {
  // 这里只做“块级解析”；事件的组包（跨 chunk）由外层 buffer 处理
  const blocks: SseBlock[] = [];
  const parts = chunkText.split("\n\n").filter((p) => p.trim());
  for (const part of parts) {
    let eventName = "message";
    const dataLines: string[] = [];
    for (const rawLine of part.split("\n")) {
      const line = rawLine.trimEnd();
      if (!line) continue;
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim() || "message";
        continue;
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart());
        continue;
      }
      // 忽略 id/retry 等
    }
    blocks.push({ event: eventName, data: dataLines.join("\n") });
  }
  return blocks;
}

function chainEventFromSse(args: {
  runId: string;
  raw: unknown;
  fallbackStepId: string;
}): ChainEvent | null {
  if (!args.raw || typeof args.raw !== "object") return null;
  const obj = args.raw as Record<string, unknown>;

  const type = typeof obj.type === "string" ? obj.type : "";
  if (!type) return null;

  const ts = typeof obj.ts === "number" && Number.isFinite(obj.ts) ? obj.ts : Date.now();
  const stepId =
    typeof obj.step_id === "string" && obj.step_id
      ? obj.step_id
      : typeof obj.step === "string" && obj.step
        ? obj.step
        : args.fallbackStepId;
  const payload =
    obj.payload && typeof obj.payload === "object"
      ? (obj.payload as Record<string, unknown>)
      : {};

  return {
    type: type as ChainEvent["type"],
    ts,
    run_id: args.runId,
    step_id: stepId,
    payload,
  };
}

type RouterDecision = {
  prefer?: string;
  candidate_mode?: string;
  final_mode?: string;
  rule_hits?: string[];
  evidence?: Record<string, unknown>;
  fallback?: string | null;
};

function extractRouterDecision(events: ChainEvent[]): RouterDecision | null {
  const last = [...events]
    .filter((e) => e.type === "router.decision")
    .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
    .at(-1);
  if (!last) return null;
  const p = last.payload ?? {};
  if (!p || typeof p !== "object") return null;
  const obj = p as Record<string, unknown>;
  return {
    prefer: typeof obj.prefer === "string" ? obj.prefer : undefined,
    candidate_mode: typeof obj.candidate_mode === "string" ? obj.candidate_mode : undefined,
    final_mode: typeof obj.final_mode === "string" ? obj.final_mode : undefined,
    rule_hits: Array.isArray(obj.rule_hits) ? (obj.rule_hits as string[]) : undefined,
    evidence:
      obj.evidence && typeof obj.evidence === "object"
        ? (obj.evidence as Record<string, unknown>)
        : undefined,
    fallback:
      typeof obj.fallback === "string"
        ? obj.fallback
        : obj.fallback === null
          ? null
          : undefined,
  };
}

function modeTone(mode: string): string {
  const m = mode.trim();
  if (m === "text2sql") return "border-indigo-500/20 bg-indigo-500/10 text-indigo-800";
  if (m === "rag") return "border-teal-500/20 bg-teal-500/10 text-teal-800";
  if (m === "no_data") return "border-slate-500/20 bg-slate-500/10 text-slate-700";
  if (m.startsWith("tool:")) return "border-amber-500/20 bg-amber-500/10 text-amber-800";
  return "border-emerald-500/20 bg-emerald-500/10 text-emerald-800";
}

export function UnifiedChatPageClient() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const tokenInputRef = useRef<HTMLInputElement | null>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

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
  const [streamingText, setStreamingText] = useState<string>("");

  const messages = useMemo(() => extractMessagesFromEvents(events), [events]);
  const routerDecision = useMemo(() => extractRouterDecision(events), [events]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 p-4 text-sm text-slate-600">
        正在加载…
      </div>
    );
  }

  const send = async (q: string) => {
    // 取消上一次 SSE
    streamAbortRef.current?.abort();
    streamAbortRef.current = null;

    setLoading(true);
    setErrorText(null);
    setFinalAnswer("");
    setStreamingText("");

    // 先把 user.message 放进 timeline，保证左栏/中栏立即有反馈
    const runId = crypto.randomUUID();
    const userEvent: ChainEvent = {
      type: "user.message",
      ts: Date.now(),
      run_id: runId,
      step_id: "user",
      payload: { text: q },
    };
    setEvents([userEvent]);

    try {
      const ac = new AbortController();
      streamAbortRef.current = ac;

      const res = await fetch("/api/py/unified/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        credentials: "include",
        signal: ac.signal,
        body: JSON.stringify({ session_id: sessionId, query: q, prefer }),
      });
      if (!res.ok) {
        const raw = await res.text().catch(() => "");
        throw new Error(pickErrorMessage(raw, res.status, res.statusText));
      }
      if (!res.body) throw new Error("SSE 响应无 body（ReadableStream 不可用）");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // 服务端可能在 done 里返回 run_id；先用本地 runId，后续如拿到再覆盖
      let currentRunId = runId;
      let donePayload: unknown = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // 按 SSE block 分割（\n\n），保留最后一个不完整块到 buffer
        const idx = buffer.lastIndexOf("\n\n");
        if (idx < 0) continue;
        const ready = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);

        const blocks = parseSseBlocks(ready);
        for (const b of blocks) {
          const j = safeJson(b.data);
          if (b.event === "chain") {
            const ev = chainEventFromSse({
              runId: currentRunId,
              raw: j,
              fallbackStepId: "chain",
            });
            if (!ev) continue;
            setEvents((prev) => [...prev, ev]);
            continue;
          }
          if (b.event === "token") {
            if (j && typeof j === "object") {
              const obj = j as Record<string, unknown>;
              const t = typeof obj.text === "string" ? obj.text : "";
              if (t) {
                setStreamingText((prev) => prev + t);
                // v1：token 也作为“最终答案”实时显示
                setFinalAnswer((prev) => (prev ? prev + t : t));
              }
            }
            continue;
          }
          if (b.event === "done") {
            donePayload = j;
            if (j && typeof j === "object") {
              const obj = j as Record<string, unknown>;
              const rid = typeof obj.run_id === "string" ? obj.run_id : "";
              if (rid.trim()) currentRunId = rid.trim();
            }
            continue;
          }
        }
      }

      // done 后收尾：从当前 events 里补一次最终答案（避免闭包拿不到最新 events）
      setEvents((prev) => {
        const inferred = extractFinalAnswer({ answer: undefined, events: prev });
        if (inferred.trim()) setFinalAnswer((fa) => (fa.trim() ? fa : inferred));
        // donePayload 仅用于调试/未来扩展，这里不落 event，避免污染时间线
        void donePayload;
        return prev;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setErrorText(msg);
    } finally {
      setLoading(false);
      streamAbortRef.current = null;
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
          {loading && streamingText.trim() ? (
            <div className="mb-4 rounded-2xl border border-[color:var(--color-border)] bg-white/60 px-3 py-2">
              <div className="text-[10px] text-slate-400">assistant（streaming）</div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                {streamingText}
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

              <details className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-3">
                <summary className="cursor-pointer select-none text-[12px] text-slate-700">
                  路由决策（intent router）
                </summary>
                <div className="mt-3 space-y-2">
                  {routerDecision?.final_mode ? (
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-700">
                      <span className="text-slate-500">final_mode</span>
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 font-mono",
                          modeTone(routerDecision.final_mode),
                        ].join(" ")}
                      >
                        {routerDecision.final_mode}
                      </span>
                      {routerDecision.candidate_mode ? (
                        <>
                          <span className="text-slate-500">candidate</span>
                          <span className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 font-mono text-slate-700">
                            {routerDecision.candidate_mode}
                          </span>
                        </>
                      ) : null}
                      {routerDecision.prefer ? (
                        <>
                          <span className="text-slate-500">prefer</span>
                          <span className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 font-mono text-slate-700">
                            {routerDecision.prefer}
                          </span>
                        </>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500">
                      （本轮 events 未发现 <span className="font-mono">router.decision</span>）
                    </div>
                  )}

                  {routerDecision?.rule_hits?.length ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500">rule_hits</div>
                      <div className="flex flex-wrap gap-2">
                        {routerDecision.rule_hits.map((h) => (
                          <span
                            key={h}
                            className="rounded-full border border-[color:var(--color-border)] bg-white/60 px-2 py-0.5 text-[11px] text-slate-700"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {routerDecision?.evidence ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500">evidence</div>
                      <pre className="max-h-[22vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-white/60 p-2 font-mono text-[10px] text-slate-700">
                        {safeStringify(routerDecision.evidence)}
                      </pre>
                    </div>
                  ) : null}

                  {typeof routerDecision?.fallback === "string" && routerDecision.fallback.trim() ? (
                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500">fallback</div>
                      <div className="whitespace-pre-wrap text-[11px] text-slate-700">
                        {routerDecision.fallback}
                      </div>
                    </div>
                  ) : null}
                </div>
              </details>

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
                    streamAbortRef.current?.abort();
                    streamAbortRef.current = null;
                    resetSession();
                    setEvents([]);
                    setErrorText(null);
                    setFinalAnswer("");
                    setStreamingText("");
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

