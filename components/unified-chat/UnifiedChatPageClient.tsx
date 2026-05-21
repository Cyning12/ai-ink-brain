"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { ChatHistoryRow } from "@/lib/chat/chatApi";
import { fetchChatHistory } from "@/lib/chat/chatApi";
import {
  readChatbiToken,
  requestChatbiAccessVerify,
  writeChatbiToken,
} from "@/lib/chatbi-client";
import { useSessionId } from "@/lib/hooks/useSessionId";
import type { ChainEvent } from "@/components/chain-chat/types";
import { UnifiedChatExecutionTracePanel } from "@/components/unified-chat/UnifiedChatExecutionTracePanel";
import { UnifiedChatRouterDebugPanel } from "@/components/unified-chat/UnifiedChatRouterDebugPanel";
import { UnifiedChatTimelinePanel } from "@/components/unified-chat/UnifiedChatTimelinePanel";
import { isValidAgentPlanPreviewPayload } from "@/lib/unified-chat/sse";
import { copyPlainToClipboard } from "@/lib/unified-chat/clipboard";
import { extractFinalAnswer, extractUserQueryText } from "@/lib/unified-chat/chainEventSelectors";
import { buildExecutionTraceCopyText } from "@/lib/unified-chat/executionTrace";
import { useTypewriterReveal } from "@/lib/unified-chat/hooks/useTypewriterReveal";
import { useUnifiedChatStream } from "@/lib/unified-chat/hooks/useUnifiedChatStream";
import { safeStringify } from "@/lib/unified-chat/stringify";

type PreferMode = "auto" | "rag" | "text2sql";

/** 跨轮会话摘要（进入页面时从 GET /api/py/chat/history 恢复，与 session_id 对齐） */
type TranscriptTurn = { id: string; user: string; assistant: string };

/** 将历史接口的扁平 messages（user/assistant 交替）转为 transcript 轮次 */
function mapHistoryRowsToTranscript(messages: ChatHistoryRow[] | undefined): TranscriptTurn[] {
  if (!messages?.length) return [];
  const out: TranscriptTurn[] = [];
  let pendingUser = "";
  for (const m of messages) {
    if (m.role === "user") {
      pendingUser = typeof m.content === "string" ? m.content.trim() : "";
    } else if (m.role === "assistant") {
      const a = typeof m.content === "string" ? m.content.trim() : "";
      out.push({
        id: `hist-${out.length}`,
        user: pendingUser,
        assistant: a,
      });
      pendingUser = "";
    }
  }
  if (pendingUser) {
    out.push({
      id: `hist-pending-${out.length}`,
      user: pendingUser,
      assistant: "",
    });
  }
  return out;
}

export function UnifiedChatPageClient() {
  const [mounted, setMounted] = useState(false);
  /** 假登录：仅 ChatBI DB 明文；校验在「解锁」按钮触发 */
  const [credentialInput, setCredentialInput] = useState("");
  const [chatbiToken, setChatbiToken] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const tokenInputRef = useRef<HTMLInputElement | null>(null);
  const lastQueryRef = useRef<string>("");

  const [prefer, setPrefer] = useState<PreferMode>("auto");
  const [debugRouter, setDebugRouter] = useState(false);
  /** 与后端 `debug_llm_prompts` / `CHATBI_V2_DEBUG_LLM_PROMPTS` 对齐；仅建议在 ?debug=1 下开启 */
  const [debugLlmPrompts, setDebugLlmPrompts] = useState(false);
  const [draft, setDraft] = useState("");
  /** 低置信预览：与首轮 user 问句、session 绑定的放行令牌（见 manifest `agent.plan.preview`） */
  type PendingPlanConfirmState = {
    token: string;
    boundQuery: string;
    sessionId: string;
    expiresInSec: number;
    receivedAtMs: number;
    sqlDraft: string;
    warnings: unknown[];
    planId: string;
    tool: string;
  };
  const [pendingPlanConfirm, setPendingPlanConfirm] = useState<PendingPlanConfirmState | null>(null);
  /** TTL 倒计时：每秒 tick，以后端校验为准 */
  const [ttlTick, setTtlTick] = useState(0);
  const dismissedPlanTokenRef = useRef<string | null>(null);
  const pendingPlanConfirmRef = useRef<PendingPlanConfirmState | null>(null);

  useEffect(() => {
    pendingPlanConfirmRef.current = pendingPlanConfirm;
  }, [pendingPlanConfirm]);

  const [errorText, setErrorText] = useState<string | null>(null);
  const [finalAnswer, setFinalAnswer] = useState<string>("");
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);

  const locked = !chatbiToken.trim();

  useEffect(() => {
    setMounted(true);
    setChatbiToken(readChatbiToken());
  }, []);

  useEffect(() => {
    if (mounted && locked) tokenInputRef.current?.focus();
  }, [mounted, locked]);

  const headers: Record<string, string> = useMemo(() => {
    const c = chatbiToken.replace(/^bearer\s+/i, "").trim();
    if (!c) return {} as Record<string, string>;
    // 与 Python GET verify / Unified 一致：Bearer 明文，经 BFF 原样转上游（或 rewrite 直连 Python）
    return { Authorization: `Bearer ${c}` };
  }, [chatbiToken]);

  const { sessionId, resetSession } = useSessionId("unified-chat");
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const [historyReady, setHistoryReady] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  /** Timeline 卡片：标题栏「全部展开/收起」受控 */
  const [timelineBatchNonce, setTimelineBatchNonce] = useState(0);
  const [timelineBatchOpen, setTimelineBatchOpen] = useState(false);

  const [debugFromUrl, setDebugFromUrl] = useState(false);
  const [typewriterFromUrl, setTypewriterFromUrl] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const read = () => {
      const sp = new URLSearchParams(window.location.search);
      setDebugFromUrl(sp.get("debug") === "1" || sp.get("debug") === "true");
      const tw = sp.get("typewriter");
      setTypewriterFromUrl(tw !== "0" && tw !== "false");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  /** 与地址栏 `?debug=1` 同步，便于本页一键开关调试区（不整段手改 URL） */
  const syncDebugUrlParam = useCallback((on: boolean) => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    if (on) {
      sp.set("debug", "1");
    } else {
      sp.delete("debug");
    }
    const qs = sp.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", next);
    setDebugFromUrl(on);
  }, []);

  const debugEnabled = debugFromUrl;

  const handlePlanPreviewChain = useCallback(
    (ev: ChainEvent, roundEvents: ChainEvent[]) => {
      if (ev.type !== "agent.plan.preview") return;
      const pl = ev.payload;
      if (!pl || typeof pl !== "object" || Array.isArray(pl)) return;
      const rec = pl as Record<string, unknown>;
      if (!isValidAgentPlanPreviewPayload(rec)) return;
      const token =
        typeof rec.plan_execution_token === "string" ? rec.plan_execution_token.trim() : "";
      if (!token || dismissedPlanTokenRef.current === token) return;
      const boundQuery = extractUserQueryText(roundEvents);
      if (!boundQuery.trim()) return;
      const ex = rec.expires_in_sec;
      setPendingPlanConfirm({
        token,
        boundQuery: boundQuery.trim(),
        sessionId: sessionIdRef.current,
        expiresInSec:
          typeof ex === "number" && Number.isFinite(ex) && ex >= 0 ? Math.floor(ex) : 0,
        receivedAtMs: Date.now(),
        sqlDraft: typeof rec.sql_draft === "string" ? rec.sql_draft : "",
        warnings: Array.isArray(rec.warnings) ? [...rec.warnings] : [],
        planId: typeof rec.plan_id === "string" ? rec.plan_id : "",
        tool: typeof rec.tool === "string" ? rec.tool : "",
      });
    },
    [],
  );

  const stream = useUnifiedChatStream({
    sessionId,
    prefer,
    debugRouter,
    debugLlmPrompts,
    headers,
    onError: (error) => {
      if (error.name === "AbortError") return;
      setErrorText(error.message);
    },
    onChainEventSideEffect: handlePlanPreviewChain,
  });

  const loading = stream.isLoading;
  const loadingRef = useRef(loading);
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    if (!debugEnabled || !stream.lastDone) return;
    console.debug("[UnifiedChat SSE done]", {
      request_id: stream.lastDone.request_id,
      run_id: stream.lastDone.run_id,
      session_id: stream.lastDone.session_id,
      ok: stream.lastDone.ok,
      mode: stream.lastDone.mode,
    });
  }, [debugEnabled, stream.lastDone]);

  const typewriterActive = typewriterFromUrl && loading;
  const revealedAnswer = useTypewriterReveal(stream.streamingText, {
    active: typewriterActive,
    charsPerTick: 2,
    tickMs: 20,
  });

  const displayAnswer = loading
    ? revealedAnswer
    : finalAnswer.trim() || stream.streamingText;

  const { timelineEvents, messages, queryTextTrace, execSections, activeRequestId, lastDone, events } =
    stream;

  useEffect(() => {
    if (debugEnabled) return;
    setDebugLlmPrompts(false);
  }, [debugEnabled]);

  // 与 ChatPanel 一致：解锁后按 session_id 拉 rag_conversation_logs，刷新/重进页面可恢复摘要
  useEffect(() => {
    if (!mounted || locked) {
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
          limit: 100,
          signal: ac.signal,
        });
        if (ac.signal.aborted || sessionIdRef.current !== sidAtStart) return;
        setTranscript(mapHistoryRowsToTranscript(data.messages));
      } catch (e) {
        if (ac.signal.aborted) return;
        if (e instanceof DOMException && e.name === "AbortError") return;
        if (sessionIdRef.current !== sidAtStart) return;
        setHistoryError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!ac.signal.aborted && sessionIdRef.current === sidAtStart) {
          setHistoryReady(true);
        }
      }
    })();

    return () => ac.abort();
  }, [mounted, locked, sessionId, headers]);

  const planPreviewTtlRemainingSec = useMemo(() => {
    if (!pendingPlanConfirm) return null;
    void ttlTick;
    const elapsed = (Date.now() - pendingPlanConfirm.receivedAtMs) / 1000;
    return Math.max(0, Math.floor(pendingPlanConfirm.expiresInSec - elapsed));
  }, [pendingPlanConfirm, ttlTick]);

  /** 浏览器下 setTimeout 返回 number，与 NodeJS.Timeout 区分 */
  const copyFeedbackTimerRef = useRef<number | null>(null);
  const [sectionCopyFeedback, setSectionCopyFeedback] = useState<"timeline" | "exec" | null>(null);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current != null) {
        window.clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = null;
      }
    };
  }, []);

  const handleCopyTimeline = useCallback(async () => {
    const body =
      timelineEvents.length === 0
        ? "（暂无 Timeline 事件）"
        : `=== Timeline（共 ${timelineEvents.length} 条，JSON）===\n${safeStringify(timelineEvents)}`;
    const ok = await copyPlainToClipboard(body);
    if (!ok) return;
    if (copyFeedbackTimerRef.current != null) window.clearTimeout(copyFeedbackTimerRef.current);
    setSectionCopyFeedback("timeline");
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setSectionCopyFeedback(null);
      copyFeedbackTimerRef.current = null;
    }, 2000);
  }, [timelineEvents]);

  const handleCopyExecutionTrace = useCallback(async () => {
    const body = buildExecutionTraceCopyText(queryTextTrace, execSections);
    const ok = await copyPlainToClipboard(body);
    if (!ok) return;
    if (copyFeedbackTimerRef.current != null) window.clearTimeout(copyFeedbackTimerRef.current);
    setSectionCopyFeedback("exec");
    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setSectionCopyFeedback(null);
      copyFeedbackTimerRef.current = null;
    }, 2000);
  }, [queryTextTrace, execSections]);

  const send = async (q: string, opts?: { planExecutionToken?: string }) => {
    const trimmed = q.trim();
    if (!trimmed) return;

    const planToken = opts?.planExecutionToken?.trim() ?? "";
    const sendingWithPlanToken = Boolean(planToken);

    if (!sendingWithPlanToken) {
      setPendingPlanConfirm(null);
      dismissedPlanTokenRef.current = null;
    } else {
      const pend = pendingPlanConfirmRef.current;
      if (
        !pend ||
        pend.token !== planToken ||
        pend.boundQuery.trim() !== trimmed ||
        pend.sessionId !== sessionId
      ) {
        setErrorText("无法按预览执行：令牌与当前会话或问题不一致，请重新发起问题。");
        return;
      }
    }

    const usedPlanTokenAtSend = sendingWithPlanToken;

    lastQueryRef.current = trimmed;
    stream.stop();
    stream.clearError();

    setErrorText(null);
    setFinalAnswer("");
    stream.resetStreamMeta();
    stream.beginRound(trimmed);
    setTimelineBatchOpen(false);
    setTimelineBatchNonce((n) => n + 1);

    try {
      await stream.sendQuery(trimmed, {
        plan_execution_token: sendingWithPlanToken ? planToken : undefined,
      });

      const latestEvents = stream.flushRoundEvents();
      const inferred = extractFinalAnswer({
        answer: stream.streamingText || undefined,
        events: latestEvents,
      });
      if (inferred.trim()) {
        setFinalAnswer((fa) => (fa.trim() ? fa : inferred));
      }
      const streamLastDone = stream.streamLastDoneRef.current;
      if (streamLastDone?.ok && lastQueryRef.current.trim() && inferred.trim()) {
        const uid = lastQueryRef.current.trim();
        const aid = inferred.trim();
        const rowId = crypto.randomUUID();
        setTranscript((t) => [...t, { id: rowId, user: uid, assistant: aid }]);
      }
      if (streamLastDone?.ok && usedPlanTokenAtSend) {
        setPendingPlanConfirm(null);
        dismissedPlanTokenRef.current = null;
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      const msg = e instanceof Error ? e.message : String(e);
      setErrorText(msg);
    }
  };

  const sendRef = useRef(send);
  sendRef.current = send;

  /** TTL 倒计时 + 过期后自动以同问句无令牌重拉 SSE，刷新 Timeline / 最终输出 */
  useEffect(() => {
    if (!pendingPlanConfirm) return;
    const id = window.setInterval(() => {
      setTtlTick((n) => n + 1);
      const pend = pendingPlanConfirmRef.current;
      if (!pend || loadingRef.current) return;
      const elapsed = (Date.now() - pend.receivedAtMs) / 1000;
      const remaining = Math.max(0, Math.floor(pend.expiresInSec - elapsed));
      if (remaining > 0) return;
      const q = pend.boundQuery.trim();
      if (!q) return;
      setPendingPlanConfirm(null);
      void sendRef.current(q);
    }, 1000);
    return () => window.clearInterval(id);
  }, [pendingPlanConfirm]);

  if (!mounted) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 p-4 text-sm text-slate-600">
        正在加载…
      </div>
    );
  }

  const executionLinkSection = (
    <UnifiedChatExecutionTracePanel
      loading={loading}
      queryTextTrace={queryTextTrace}
      execSections={execSections}
      copyLabel={sectionCopyFeedback === "exec" ? "已复制" : "复制"}
      onCopy={handleCopyExecutionTrace}
    />
  );

  const timelineSection = (
    <UnifiedChatTimelinePanel
      timelineEvents={timelineEvents}
      timelineBatchNonce={timelineBatchNonce}
      timelineBatchOpen={timelineBatchOpen}
      onExpandAll={() => {
        setTimelineBatchOpen(true);
        setTimelineBatchNonce((n) => n + 1);
      }}
      onCollapseAll={() => {
        setTimelineBatchOpen(false);
        setTimelineBatchNonce((n) => n + 1);
      }}
      onCopy={handleCopyTimeline}
      copyLabel={sectionCopyFeedback === "timeline" ? "已复制" : "复制"}
    />
  );

  return (
    <div className="space-y-4">
      {locked ? (
        <section className="mx-auto max-w-lg rounded-2xl border border-[color:var(--color-border)] bg-white/40 p-4">
          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-slate-700">
              请输入 <strong>ChatBI DB 明文访问令牌</strong>（
              <span className="font-mono">chatbi_access_tokens</span>
              ），点击<strong>解锁</strong>：由 Next BFF 转发 <span className="font-mono">GET /api/py/chatbi/access/verify</span>{" "}
              到 Python 校验；**不**使用 <span className="font-mono">NEXT_PUBLIC_ADMIN_SECRET</span>
              。通过后令牌写入 <span className="font-mono">localStorage</span>，后续 Unified / 历史请求均带{" "}
              <span className="font-mono">Authorization: Bearer &lt;明文&gt;</span>（与 Python 约定一致）。
            </p>
            <label className="block text-[11px] text-slate-500">
              访问令牌（明文）
              <input
                ref={tokenInputRef}
                type="password"
                value={credentialInput}
                onChange={(e) => {
                  setCredentialInput(e.target.value);
                  setUnlockError(null);
                }}
                className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                placeholder="解锁后请求带 Authorization: Bearer <明文>"
                autoComplete="off"
              />
            </label>
            {unlockError ? (
              <p className="text-[12px] leading-relaxed text-rose-600/90">{unlockError}</p>
            ) : null}
            <button
              type="button"
              disabled={unlockBusy}
              onClick={() => {
                void (async () => {
                  setUnlockError(null);
                  const v = credentialInput.trim();
                  if (!v) {
                    setUnlockError("请输入 ChatBI 明文 token");
                    return;
                  }
                  const plain = v.replace(/^bearer\s+/i, "").trim();
                  if (!plain) {
                    setUnlockError("请输入有效的 ChatBI 明文 token");
                    return;
                  }
                  setUnlockBusy(true);
                  try {
                    const gate = await requestChatbiAccessVerify({ plain });
                    if (!gate.ok) {
                      setUnlockError(gate.message);
                      return;
                    }
                    writeChatbiToken(plain);
                    setChatbiToken(plain);
                    setCredentialInput("");
                  } finally {
                    setUnlockBusy(false);
                  }
                })();
              }}
              className="w-full rounded-xl bg-[#2c2c2c] px-3 py-2 text-sm text-[#f9f9f7] hover:opacity-90 disabled:opacity-50"
            >
              {unlockBusy ? "校验中…" : "解锁"}
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-3">
            <div className="flex flex-wrap items-end gap-4">
              <div className="min-w-0 flex-1 space-y-2 text-[11px] text-slate-600">
                <p className="leading-relaxed text-slate-600">
                  同一浏览器内连续提问共享上下文，直至点击「新会话」。只要{" "}
                  <span className="font-mono">session_id</span> 不变且后端已落库，刷新或再次进入本页会从{" "}
                  <span className="font-mono">/api/py/chat/history</span> 恢复下方「历史消息」摘要；Timeline
                  仍仅展示当前轮 SSE。
                </p>
                {debugEnabled ? (
                  <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300/80 bg-slate-50/80 px-2 py-1.5 font-mono text-[11px] text-slate-800">
                    <span className="text-slate-500">session_id（前 8 位）</span>
                    <span>{sessionId.slice(0, 8)}</span>
                    <button
                      type="button"
                      className="rounded border border-[color:var(--color-border)] bg-white px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-50"
                      onClick={() => void navigator.clipboard.writeText(sessionId)}
                    >
                      复制完整 id
                    </button>
                  </div>
                ) : null}
              </div>
              <label className="block text-[11px] text-slate-500">
                prefer
                <select
                  value={prefer}
                  onChange={(e) => setPrefer(e.target.value as PreferMode)}
                  className="mt-1 min-w-[140px] rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
                >
                  <option value="auto">auto</option>
                  <option value="rag">rag</option>
                  <option value="text2sql">text2sql</option>
                </select>
              </label>
              <div className="flex shrink-0 flex-col gap-1">
                <span className="text-[11px] text-slate-500">页面调试</span>
                {debugEnabled ? (
                  <button
                    type="button"
                    onClick={() => syncDebugUrlParam(false)}
                    className="rounded-xl border border-slate-400/40 bg-white/80 px-3 py-2 text-[12px] text-slate-800 hover:bg-slate-50"
                    title="从地址栏移除 debug 参数并隐藏调试区"
                  >
                    关闭调试模式
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => syncDebugUrlParam(true)}
                    className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-950 hover:bg-amber-500/15"
                    title="等同在地址栏加上 ?debug=1"
                  >
                    开启调试模式
                  </button>
                )}
              </div>
            </div>
          </section>

          {!historyReady ? (
            <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-3">
              <p className="text-[12px] text-slate-500">正在加载本会话历史…</p>
            </section>
          ) : historyError ? (
            <section className="rounded-2xl border border-amber-200/80 bg-amber-50/50 px-4 py-3">
              <p className="text-[12px] text-amber-900/90">
                历史接口不可用（将无法从服务端恢复摘要）：{historyError}
              </p>
            </section>
          ) : transcript.length > 0 ? (
            <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
              <div className="border-b border-[color:var(--color-border)] px-4 py-3">
                <div className="font-serif text-sm text-[#2c2c2c]">历史消息</div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  已完成轮次摘要（来自 rag_conversation_logs）；当前轮 Timeline 与下方「消息」区仅展示本轮
                </div>
              </div>
              <div className="max-h-[36vh] space-y-3 overflow-auto px-4 py-3">
                {transcript.map((row) => (
                  <div
                    key={row.id}
                    className="space-y-2 rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/80 px-3 py-2"
                  >
                    <div>
                      <div className="text-[10px] text-slate-400">user</div>
                      <div className="mt-0.5 whitespace-pre-wrap text-sm text-slate-900">{row.user}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">assistant</div>
                      <div className="mt-0.5 whitespace-pre-wrap text-sm text-slate-800">{row.assistant}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {lastDone?.persist && lastDone.persist.ok === false ? (
            <section className="rounded-2xl border border-rose-300/70 bg-rose-50/90 px-4 py-3">
              <div className="font-serif text-sm text-rose-950">会话落库失败</div>
              <p className="mt-1 text-[12px] leading-relaxed text-rose-900/95">
                本轮回答已生成，但写入 <span className="font-mono">rag_conversation_logs</span> 未成功，多轮上下文与历史摘要可能缺本轮。请检查
                Supabase 网络或表结构；详情见下方 Debug 或 Timeline 中的{" "}
                <span className="font-mono">error · agent_db</span> 事件。
              </p>
              <pre className="mt-2 max-h-[20vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-rose-200/80 bg-white/80 p-2 font-mono text-[10px] text-rose-950">
                {safeStringify(lastDone.persist)}
              </pre>
            </section>
          ) : null}

          {lastDone && lastDone.ok === false ? (
            <section className="rounded-2xl border border-rose-300/70 bg-rose-50/90 px-4 py-3">
              <div className="font-serif text-sm text-rose-950">本轮未完成（done · ok=false）</div>
              <p className="mt-1 text-[12px] leading-relaxed text-rose-900/95">
                请查看左侧 Timeline 或右侧执行链路中的 <span className="font-mono">error</span> 链事件；开启页面{" "}
                <span className="font-mono">?debug=1</span> 可查看 <span className="font-mono">done</span> 完整载荷。
              </p>
              {debugEnabled ? (
                <pre className="mt-2 max-h-[20vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-rose-200/80 bg-white/80 p-2 font-mono text-[10px] text-rose-950">
                  {safeStringify(lastDone)}
                </pre>
              ) : null}
            </section>
          ) : null}

          {/* Timeline（左）| 执行链路 + Timeline 输出（右）：固定左右双栏 */}
          <div className="grid min-h-0 grid-cols-2 gap-4 [&>section]:min-w-0">
            {timelineSection}
            {executionLinkSection}
          </div>

          <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
            <div className="border-b border-[color:var(--color-border)] px-4 py-3">
              <div className="font-serif text-sm text-[#2c2c2c]">消息</div>
              <div className="mt-0.5 text-[11px] text-slate-500">
                最终答案以 <span className="font-mono">assistant.message</span> 为准
                {typewriterFromUrl ? (
                  <span className="text-slate-400">
                    {" "}
                    · 打字机 v0（<span className="font-mono">?typewriter=0</span> 关闭）
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {" "}
                    · 块级直出（<span className="font-mono">?typewriter=1</span> 开启）
                  </span>
                )}
              </div>
            </div>
            <div className="max-h-[50vh] overflow-auto px-4 py-4">
              {displayAnswer.trim() ? (
                <div className="mb-4 rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/90 px-3 py-2">
                  <div className="text-[10px] text-slate-400">最终答案</div>
                  <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">
                    {displayAnswer}
                    {typewriterActive && displayAnswer.length < stream.streamingText.length ? (
                      <span className="ml-0.5 inline-block animate-pulse text-slate-500">▍</span>
                    ) : null}
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
                      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{m.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-4">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-slate-700">Router Debug</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    开启后请求会透传 <span className="font-mono">debug_router: true</span>，并展示{" "}
                    <span className="font-mono">router.evidence.details</span> 与 Intent 缓存可观测字段（
                    <span className="font-mono">agent.intent</span>）
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const next = !debugRouter;
                    setDebugRouter(next);
                    if (loading && lastQueryRef.current.trim()) {
                      stream.stop();
                      await send(lastQueryRef.current.trim());
                    }
                  }}
                  className={[
                    "shrink-0 rounded-full border px-3 py-1 text-[11px]",
                    debugRouter
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800"
                      : "border-[color:var(--color-border)] bg-white/60 text-slate-700",
                  ].join(" ")}
                  title={debugRouter ? "点击关闭（会清理当前会话的 debug 节点）" : "点击开启（必要时会重连 SSE）"}
                >
                  {debugRouter ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {debugEnabled ? (
              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] text-slate-700">LLM Prompt 调试</div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      开启后请求体附带 <span className="font-mono">debug_llm_prompts: true</span>
                      ，Timeline 展示{" "}
                      <span className="font-mono">agent.debug.llm_prompts</span>（含 Intent / 工具链各段
                      messages）。服务端亦可设环境变量{" "}
                      <span className="font-mono">CHATBI_V2_DEBUG_LLM_PROMPTS=1</span> 强制开启。内容可能较长且含
                      system 指令，请勿对不可信受众默认开启。
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const next = !debugLlmPrompts;
                      setDebugLlmPrompts(next);
                      if (loading && lastQueryRef.current.trim()) {
                        stream.stop();
                        await send(lastQueryRef.current.trim());
                      }
                    }}
                    className={[
                      "shrink-0 rounded-full border px-3 py-1 text-[11px]",
                      debugLlmPrompts
                        ? "border-orange-500/40 bg-orange-500/10 text-orange-950"
                        : "border-[color:var(--color-border)] bg-white/60 text-slate-700",
                    ].join(" ")}
                    title={
                      debugLlmPrompts
                        ? "点击关闭（会清理当前会话中的 LLM prompt 调试事件）"
                        : "点击开启（必要时会重连 SSE）"
                    }
                  >
                    {debugLlmPrompts ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            ) : null}

              <UnifiedChatRouterDebugPanel events={events} debugRouter={debugRouter} />

              {debugEnabled ? (
                <details className="rounded-2xl border border-[color:var(--color-border)] bg-white/60 p-3">
                  <summary className="cursor-pointer select-none text-[12px] text-slate-700">
                    Debug（SSE done）
                  </summary>
                  <div className="mt-3 space-y-2 text-[11px] text-slate-700">
                    <div>
                      request_id:{" "}
                      <span className="font-mono">{activeRequestId || "（等待 done）"}</span>
                    </div>
                    {lastDone ? (
                      <pre className="max-h-[18vh] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[color:var(--color-border)] bg-[#f9f9f7]/70 p-2 font-mono text-[10px] text-slate-700">
                        {safeStringify(lastDone)}
                      </pre>
                    ) : null}
                  </div>
                </details>
              ) : null}

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

              {pendingPlanConfirm ? (
                <div className="space-y-2 rounded-xl border border-indigo-300/70 bg-indigo-50/50 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[12px] font-semibold text-indigo-950">低置信 · 预览 SQL 已就绪</div>
                    {planPreviewTtlRemainingSec != null ? (
                      <span className="rounded-full border border-indigo-400/40 bg-white/80 px-2 py-0.5 font-mono text-[10px] text-indigo-900">
                        约 {planPreviewTtlRemainingSec}s 后过期
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    须使用与预览时相同的 <span className="font-mono">query</span> 与{" "}
                    <span className="font-mono">session_id</span>。若修改输入框中的问题并点击「发送」，将丢弃本令牌。令牌过期后将自动以同问句重新请求（不带令牌）。
                  </p>
                  {planPreviewTtlRemainingSec === 0 && !loading ? (
                    <p className="text-[11px] font-medium text-amber-900/90">令牌已过期，正在自动重新请求…</p>
                  ) : null}
                  <div className="max-h-[28vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-indigo-200/80 bg-white/70 px-2 py-2 font-mono text-[11px] text-slate-900">
                    {pendingPlanConfirm.sqlDraft.trim() ? pendingPlanConfirm.sqlDraft : "（无 sql_draft）"}
                  </div>
                  {pendingPlanConfirm.warnings.length > 0 ? (
                    <ul className="list-disc space-y-1 pl-4 text-[11px] text-slate-800">
                      {pendingPlanConfirm.warnings.map((w, wi) => (
                        <li key={wi}>
                          {typeof w === "string" ? w : safeStringify(w)}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={
                        loading ||
                        sessionId !== pendingPlanConfirm.sessionId ||
                        planPreviewTtlRemainingSec === 0
                      }
                      onClick={() => {
                        setDraft(pendingPlanConfirm.boundQuery);
                        void send(pendingPlanConfirm.boundQuery, {
                          planExecutionToken: pendingPlanConfirm.token,
                        });
                      }}
                      className="rounded-xl bg-indigo-700 px-4 py-2 text-sm text-white hover:bg-indigo-800 disabled:opacity-40"
                    >
                      按预览执行
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        const q = pendingPlanConfirm.boundQuery.trim();
                        setPendingPlanConfirm(null);
                        if (q) void send(q);
                      }}
                      className="rounded-xl border border-[color:var(--color-border)] bg-white/70 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      取消（丢弃令牌）
                    </button>
                  </div>
                </div>
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
                    stream.stop();
                    resetSession();
                    setTranscript([]);
                    stream.clearEvents();
                    setPendingPlanConfirm(null);
                    dismissedPlanTokenRef.current = null;
                    setTimelineBatchOpen(false);
                    setTimelineBatchNonce((n) => n + 1);
                    setErrorText(null);
                    setFinalAnswer("");
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
          </section>
        </>
      )}
    </div>
  );
}
