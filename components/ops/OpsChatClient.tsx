"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { OpsCollapsibleSection } from "@/components/ops/OpsCollapsibleSection";
import { OpsRunArtifacts } from "@/components/ops/OpsRunArtifacts";
import { OpsThinkingHint } from "@/components/ops/OpsThinkingHint";
import { ThinkingChainTimeline } from "@/components/ops/ThinkingChainTimeline";
import { getOrCreateOpsChatSessionId } from "@/lib/ops/chat-session";
import {
  appendOpsChatTurn,
  copyTextToClipboard,
  createOpsChatTurn,
  extractOpsFinalAnswer,
  extractOpsLlmModelsUsed,
  extractOpsModelFallbackChain,
  fetchOpsChatModels,
  fetchOpsRun,
  fetchOpsRunEvents,
  findCheckpointResumeEvent,
  findClarifyEvent,
  findReactMaxStepsEvent,
  formatModelFallbackChainLabel,
  formatOpsEventSummary,
  isOpsRunComplete,
  isRunActive,
  mergeOpsEvents,
  serializeOpsEventForCopy,
  serializeOpsEventsForCopy,
  sendOpsChatMessage,
  updateOpsChatTurn,
  type OpsChatModel,
  type OpsChatTurn,
} from "@/lib/ops/chat";

const POLL_INTERVAL_MS = 1200;
const MAX_TURNS = 50;

type OpsChatClientProps = {
  sessionId?: string;
  title?: string;
  subtitle?: string;
  onRunComplete?: (runId: string) => void;
};

export function OpsChatClient({
  sessionId: externalSessionId,
  title = "Ops Chat",
  subtitle = "基于 ops_run_events 的 Orchestrator 对话 · after_seq 增量轮询",
  onRunComplete,
}: OpsChatClientProps = {}) {
  const externalTrimmed = externalSessionId?.trim() ?? "";
  // sessionId 来自 localStorage 时须客户端挂载后再解析，避免 SSR hydration 不一致
  const [sessionId, setSessionId] = useState(externalTrimmed);
  const [showSessionId, setShowSessionId] = useState(Boolean(externalTrimmed));

  useEffect(() => {
    if (externalTrimmed) {
      setSessionId(externalTrimmed);
      setShowSessionId(true);
      return;
    }
    setSessionId(getOrCreateOpsChatSessionId());
    setShowSessionId(true);
  }, [externalTrimmed]);

  const [draft, setDraft] = useState("");
  const [clarifyDraft, setClarifyDraft] = useState("");
  const [models, setModels] = useState<OpsChatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [providerLabel, setProviderLabel] = useState("");
  const [autoFallback, setAutoFallback] = useState(false);
  const [turns, setTurns] = useState<OpsChatTurn[]>([]);
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(true);
  const [artifactsExpanded, setArtifactsExpanded] = useState(false);

  useEffect(() => {
    void fetchOpsChatModels().then((data) => {
      if (!data) return;
      setModels(data.models);
      setSelectedModel(data.default_model);
      setProviderLabel(data.provider);
      setAutoFallback(data.auto_fallback);
    });
  }, []);

  const activeTurn = useMemo(
    () => turns.find((turn) => turn.runId === activeRunId) ?? null,
    [turns, activeRunId],
  );

  const activeEvents = activeTurn?.events ?? [];
  const activeRunComplete = isOpsRunComplete({
    status: activeTurn?.status ?? null,
    loading,
    polling,
  });

  const handleSend = useCallback(
    async (messageOverride?: string) => {
      const message = (messageOverride ?? draft).trim();
      if (!message || loading) return;

      setLoading(true);
      setError(null);
      setEventsExpanded(true);

      const activeSessionId =
        sessionId || externalTrimmed || getOrCreateOpsChatSessionId();
      if (!sessionId) setSessionId(activeSessionId);

      const result = await sendOpsChatMessage(
        message,
        activeSessionId,
        selectedModel || undefined,
      );

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      const { data } = result;
      const turn = createOpsChatTurn({
        runId: data.run_id,
        query: message,
        route: data.route,
        status: data.status,
        finalAnswer: data.answer ?? "",
        clarifyQuestion: data.clarify_question,
      });
      setTurns((prev) => appendOpsChatTurn(prev, turn, { maxTurns: MAX_TURNS }));
      setActiveRunId(data.run_id);
      setDraft("");
      setClarifyDraft("");

      if (
        (data.route === "fast" || data.route === "session_00") &&
        typeof data.answer === "string"
      ) {
        setLoading(false);
        setPolling(true);
        return;
      }

      if (data.route === "clarify" && data.needs_clarification) {
        setLoading(false);
        // clarify 状态下不轮询，等待用户输入
        return;
      }

      setLoading(false);
      setPolling(true);
    },
    [draft, externalTrimmed, loading, selectedModel, sessionId],
  );

  const handleClarifySubmit = useCallback(() => {
    const answer = clarifyDraft.trim();
    if (!answer) return;
    void handleSend(answer);
  }, [clarifyDraft, handleSend]);

  const handleSkipClarify = useCallback(() => {
    const pendingQuestion = activeTurn?.query;
    if (!pendingQuestion) return;
    // 跳过澄清：重新发送原问题，让后端走 FALLBACK/ReAct
    void handleSend(pendingQuestion);
  }, [activeTurn?.query, handleSend]);

  useEffect(() => {
    if (!activeRunId || !polling) return;
    const currentRunId = activeRunId;

    let cancelled = false;
    let timer: number | null = null;

    async function tick(afterSeq: number) {
      if (cancelled) return;
      const [runRes, eventsRes] = await Promise.all([
        fetchOpsRun(currentRunId),
        fetchOpsRunEvents(currentRunId, afterSeq),
      ]);

      if (cancelled) return;

      let latestSeq = afterSeq;
      setTurns((prev) => {
        const turn = prev.find((t) => t.runId === currentRunId);
        if (!turn) return prev;

        const mergedEvents = eventsRes?.events?.length
          ? mergeOpsEvents(turn.events, eventsRes.events)
          : turn.events;
        if (eventsRes?.events?.length) {
          latestSeq = Math.max(...eventsRes.events.map((e) => e.seq));
        }

        const finalAnswer =
          runRes?.final_answer?.answer != null
            ? String(runRes.final_answer.answer)
            : extractOpsFinalAnswer(mergedEvents);

        return updateOpsChatTurn(prev, currentRunId, {
          route: runRes?.route ?? turn.route,
          status: runRes?.status ?? turn.status,
          finalAnswer,
          events: mergedEvents,
        });
      });

      const stillActive = runRes ? isRunActive(runRes.status) : false;

      if (stillActive) {
        timer = window.setTimeout(() => void tick(latestSeq), POLL_INTERVAL_MS);
      } else {
        setPolling(false);
        setActiveRunId(null);
        onRunComplete?.(currentRunId);
      }
    }

    void tick(0);

    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [activeRunId, polling, onRunComplete]);

  const finalAnswer = activeTurn?.finalAnswer ?? "";
  const showFinalAnswer = activeRunComplete && Boolean(finalAnswer.trim());

  const isDeep = activeTurn?.route === "deep";
  const isReact = activeTurn?.route === "react";
  const modelFallbackSteps = extractOpsModelFallbackChain(activeEvents);
  const llmModelsUsed = extractOpsLlmModelsUsed(activeEvents);
  const modelChainLabel = formatModelFallbackChainLabel(
    selectedModel,
    modelFallbackSteps,
    llmModelsUsed,
  );

  const runEventsTitle = isReact ? "ReAct 推理链" : isDeep ? "Deep 思考链" : "运行事件";
  const runEventsSubtitle = isReact
    ? "多步工具调用 · 运行中仅展示事件 · 完成后展示终答"
    : isDeep
      ? "分析 / Review / 最终答案 · 结构化事件分区"
      : "seq 递增 · 按 after_seq 增量合并";
  const runEventsEmptyHint = isReact
    ? loading || polling
      ? "thinking……"
      : "发送复杂对比类问题后，此处展示 ReAct 步。"
    : isDeep
      ? loading || polling
        ? "thinking……"
        : "发送问题后，此处展示 Deep 思考链。"
      : loading || polling
        ? "thinking……"
        : "发送问题后，此处展示 ops_run_events 时间线。";
  const showRunEventsSection = isReact || isDeep || !isReact;
  const isThinking = loading || polling || (activeTurn ? isRunActive(activeTurn.status) : false);

  const clarifyEvent =
    activeTurn?.route === "clarify"
      ? findClarifyEvent(activeTurn.events) ??
        (activeTurn.clarifyQuestion
          ? { clarify_question: activeTurn.clarifyQuestion, session_id: sessionId }
          : null)
      : null;
  const checkpointResume = findCheckpointResumeEvent(activeEvents);
  const reactMaxSteps = findReactMaxStepsEvent(activeEvents);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            {title}
          </h1>
          <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
            {subtitle}
          </p>
          {showSessionId && sessionId ? (
            <p className="mt-1 font-mono text-[10px] text-slate-500">{sessionId}</p>
          ) : null}
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
          placeholder="输入问题，例如：最近指标趋势、#545 适合我吗、P0 完成没"
        />
        {models.length > 0 ? (
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <label className="text-[11px] text-slate-500 shrink-0" htmlFor="ops-chat-model">
              模型 · {providerLabel}
              {autoFallback ? "（无额度自动换模）" : ""}
            </label>
            <select
              id="ops-chat-model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded-lg border border-[color:var(--color-border)] bg-white/80 px-2 py-1.5 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}{m.test_only ? " · 测试" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {modelChainLabel ? (
          <p className="text-[11px] leading-relaxed text-amber-900/90 rounded-lg border border-amber-200/80 bg-amber-50/70 px-2 py-1.5">
            {modelChainLabel}
          </p>
        ) : null}
        {modelFallbackSteps.length > 0 ? (
          <div className="rounded-lg border border-slate-200/80 bg-white/60 px-2 py-2">
            <div className="text-[11px] font-medium text-slate-600">换模明细</div>
            <ol className="mt-1 space-y-1 text-[11px] text-slate-700">
              {modelFallbackSteps.map((step) => (
                <li key={step.seq} className="font-mono">
                  seq {step.seq} · {step.fromModel} → {step.toModel}
                  {step.step ? ` · ${step.step}` : ""}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500">
            {activeRunId ? `run: ${activeRunId}` : "未发起运行"}
          </span>
          <button
            type="button"
            onClick={() => void handleSend()}
            disabled={loading || !draft.trim()}
            className="rounded-xl bg-[#2c2c2c] px-4 py-2 text-sm text-[#f9f9f7] disabled:opacity-40"
          >
            {loading ? "…" : "发送"}
          </button>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-200/90 bg-rose-50/90 px-4 py-3">
          <div className="font-serif text-sm text-rose-950">请求失败</div>
          <p className="mt-1 text-[12px] leading-relaxed text-rose-900/95">{error}</p>
        </section>
      ) : null}

      {clarifyEvent ? (
        <section className="rounded-2xl border border-violet-200/90 bg-violet-50/80 px-4 py-4">
          <div className="font-serif text-sm text-violet-950">需要澄清</div>
          <p className="mt-1 text-[12px] leading-relaxed text-violet-900/95">{clarifyEvent.clarify_question}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={clarifyDraft}
              onChange={(e) => setClarifyDraft(e.target.value)}
              placeholder="补充信息…"
              className="flex-1 rounded-xl border border-violet-200 bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-violet-400"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleClarifySubmit();
              }}
            />
            <button
              type="button"
              onClick={() => void handleClarifySubmit()}
              disabled={!clarifyDraft.trim()}
              className="rounded-xl bg-violet-900 px-4 py-2 text-sm text-white disabled:opacity-40"
            >
              发送
            </button>
            <button
              type="button"
              onClick={() => void handleSkipClarify()}
              className="rounded-xl border border-violet-300 bg-white/70 px-4 py-2 text-sm text-violet-900"
            >
              跳过
            </button>
          </div>
        </section>
      ) : null}

      {checkpointResume ? (
        <section className="rounded-2xl border border-emerald-200/90 bg-emerald-50/80 px-4 py-3">
          <div className="font-serif text-sm text-emerald-950">Checkpoint 续跑</div>
          <p className="mt-1 text-[12px] leading-relaxed text-emerald-900/95">
            从运行 <span className="font-mono">{checkpointResume.from_run_id}</span> 恢复，
            已走 <span className="font-mono">{checkpointResume.step}</span> 步，继续处理当前问题。
          </p>
        </section>
      ) : null}

      {reactMaxSteps != null ? (
        <section className="rounded-2xl border border-amber-200/90 bg-amber-50/80 px-4 py-3">
          <div className="font-serif text-sm text-amber-950">ReAct 步数已达上限</div>
          <p className="mt-1 text-[12px] leading-relaxed text-amber-900/95">
            当前运行已触发最大步数限制（{reactMaxSteps} 步），将基于已有证据生成最终答案。
          </p>
        </section>
      ) : null}

      {turns.length > 0 ? (
        <section className="space-y-3">
          <div className="text-[11px] font-medium text-slate-500">对话历史</div>
          <ul className="space-y-3">
            {turns.map((turn) => {
              const isActive = turn.runId === activeRunId;
              const isClarify = turn.route === "clarify";
              const turnClarify = isClarify ? findClarifyEvent(turn.events) : null;
              const turnComplete = isOpsRunComplete({
                status: turn.status,
                loading: false,
                polling: isActive && polling,
              });
              return (
                <li
                  key={turn.runId}
                  className={`rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-3 ${isActive ? "ring-1 ring-slate-200" : ""}`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono">{turn.runId}</span>
                    <span>·</span>
                    <span className="font-mono">{turn.route}</span>
                    <span>·</span>
                    <span>{turn.status}</span>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-[#2c2c2c]">{turn.query}</div>
                  {turnClarify ? (
                    <div className="mt-2 rounded-lg border border-violet-200/80 bg-violet-50/50 px-3 py-2 text-[12px] text-violet-900/90">
                      澄清：{turnClarify.clarify_question}
                    </div>
                  ) : null}
                  {turnComplete && turn.finalAnswer ? (
                    <div className="mt-2 rounded-lg border border-slate-200/80 bg-[#f9f9f7]/80 px-3 py-2">
                      <div className="text-[10px] font-medium text-slate-500">最终答案</div>
                      <div className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{turn.finalAnswer}</div>
                    </div>
                  ) : null}
                  {isActive && (loading || polling) ? (
                    <div className="mt-2">
                      <OpsThinkingHint label="thinking……"></OpsThinkingHint>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {showFinalAnswer && activeTurn ? (
        <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
          <div className="border-b border-[color:var(--color-border)] px-4 py-3">
            <div className="font-serif text-sm text-[#2c2c2c]">最终答案</div>
            {activeTurn.status ? (
              <div className="mt-0.5 text-[11px] text-slate-500">
                run 已结束 · status={activeTurn.status}
              </div>
            ) : null}
          </div>
          <div className="px-4 py-4">
            <div className="whitespace-pre-wrap text-sm text-slate-800">{finalAnswer}</div>
          </div>
        </section>
      ) : null}

      {activeTurn ? (
        <OpsRunArtifacts
          runId={activeTurn.runId}
          expanded={artifactsExpanded}
          onExpandedChange={setArtifactsExpanded}
        />
      ) : null}

      {showRunEventsSection ? (
        <OpsCollapsibleSection
          title={runEventsTitle}
          subtitle={runEventsSubtitle}
          expanded={eventsExpanded}
          onExpandedChange={setEventsExpanded}
          actions={
            activeEvents.length > 0 ? (
              <button
                type="button"
                onClick={() => void copyTextToClipboard(serializeOpsEventsForCopy(activeEvents))}
                className="shrink-0 rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300"
              >
                复制全部
              </button>
            ) : null
          }
        >
          {isDeep ? (
            activeEvents.length === 0 ? (
              isThinking ? (
                <OpsThinkingHint />
              ) : (
                <p className="text-[12px] leading-relaxed text-slate-500">{runEventsEmptyHint}</p>
              )
            ) : (
              <ThinkingChainTimeline events={activeEvents} showCopyButtons={false} />
            )
          ) : isReact ? (
            activeEvents.length === 0 ? (
              isThinking ? (
                <OpsThinkingHint />
              ) : (
                <p className="text-[12px] leading-relaxed text-slate-500">{runEventsEmptyHint}</p>
              )
            ) : (
              <ul className="space-y-2">
                {activeEvents.map((e) => (
                  <li
                    key={e.seq}
                    className="rounded-lg border border-violet-200/70 bg-violet-50/30 px-3 py-2 text-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono">seq {e.seq}</span>
                      <span>·</span>
                      <span className="font-mono text-slate-700">{e.agent_role}</span>
                      <span>·</span>
                      <span className="font-mono text-violet-900/80">{e.event_type}</span>
                      <button
                        type="button"
                        onClick={() => void copyTextToClipboard(serializeOpsEventForCopy(e))}
                        className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600"
                      >
                        复制
                      </button>
                    </div>
                    <div className="mt-1 text-slate-800">{formatOpsEventSummary(e)}</div>
                    {Object.keys(e.payload ?? {}).length > 0 ? (
                      <pre className="mt-2 max-h-[24vh] overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200/60 bg-white/80 p-2 font-mono text-[10px] text-slate-700">
                        {JSON.stringify(e.payload, null, 2)}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ul>
            )
          ) : activeEvents.length === 0 ? (
            isThinking ? (
              <OpsThinkingHint />
            ) : (
              <p className="text-[12px] leading-relaxed text-slate-500">{runEventsEmptyHint}</p>
            )
          ) : (
            <ul className="space-y-2">
              {activeEvents.map((e) => (
                <li
                  key={e.seq}
                  className="rounded-lg border border-slate-200/80 bg-[#f9f9f7]/80 px-3 py-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono">seq {e.seq}</span>
                    <span>·</span>
                    <span className="font-mono text-slate-700">{e.agent_role}</span>
                    <span>·</span>
                    <span className="font-mono text-indigo-900/80">{e.event_type}</span>
                    <button
                      type="button"
                      onClick={() => void copyTextToClipboard(serializeOpsEventForCopy(e))}
                      className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600"
                    >
                      复制
                    </button>
                  </div>
                  <div className="mt-1 text-slate-800">{formatOpsEventSummary(e)}</div>
                  {Object.keys(e.payload ?? {}).length > 0 ? (
                    <pre className="mt-2 max-h-[24vh] overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200/60 bg-white/80 p-2 font-mono text-[10px] text-slate-700">
                      {JSON.stringify(e.payload, null, 2)}
                    </pre>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </OpsCollapsibleSection>
      ) : null}

      {!showFinalAnswer && isThinking ? (
        <OpsThinkingHint label="thinking…… 完成后将展示最终答案" />
      ) : null}
    </div>
  );
}
