"use client";

import { useCallback, useEffect, useState } from "react";

import { OpsCollapsibleSection } from "@/components/ops/OpsCollapsibleSection";
import { OpsThinkingHint } from "@/components/ops/OpsThinkingHint";
import { ThinkingChainTimeline } from "@/components/ops/ThinkingChainTimeline";
import {
  copyTextToClipboard,
  extractOpsFinalAnswer,
  extractOpsLlmModelsUsed,
  extractOpsModelFallbackChain,
  fetchOpsChatModels,
  fetchOpsRun,
  fetchOpsRunEvents,
  formatModelFallbackChainLabel,
  formatOpsEventSummary,
  isOpsRunComplete,
  isRunActive,
  mergeOpsEvents,
  serializeOpsEventForCopy,
  serializeOpsEventsForCopy,
  sendOpsChatMessage,
  type OpsChatModel,
  type OpsRun,
  type OpsRunEvent,
} from "@/lib/ops/chat";
import { sendOpsSessionMessage } from "@/lib/ops/session";

const POLL_INTERVAL_MS = 1200;

type OpsChatClientProps = {
  sessionId?: string;
  title?: string;
  subtitle?: string;
  onRunComplete?: (runId: string) => void;
};

export function OpsChatClient({
  sessionId,
  title = "Ops Chat",
  subtitle = "基于 ops_run_events 的 Orchestrator 对话 · after_seq 增量轮询",
  onRunComplete,
}: OpsChatClientProps = {}) {
  const [draft, setDraft] = useState("");
  const [models, setModels] = useState<OpsChatModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [providerLabel, setProviderLabel] = useState("");
  const [autoFallback, setAutoFallback] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<OpsRun | null>(null);
  const [events, setEvents] = useState<OpsRunEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [eventsExpanded, setEventsExpanded] = useState(true);

  useEffect(() => {
    void fetchOpsChatModels().then((data) => {
      if (!data) return;
      setModels(data.models);
      setSelectedModel(data.default_model);
      setProviderLabel(data.provider);
      setAutoFallback(data.auto_fallback);
    });
  }, []);

  const handleSend = useCallback(async () => {
    const message = draft.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setRun(null);
    setEvents([]);
    setRunId(null);
    setPolling(false);
    setEventsExpanded(true);

    const result = sessionId
      ? await sendOpsSessionMessage(sessionId, message, selectedModel || undefined)
      : await sendOpsChatMessage(message, undefined, selectedModel || undefined);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const { data } = result;
    setRunId(data.run_id);

    if (
      (data.route === "fast" || data.route === "session_00") &&
      typeof data.answer === "string"
    ) {
      setRun({
        id: data.run_id,
        repo_id: "",
        session_id: sessionId ?? null,
        query: message,
        route: data.route === "session_00" ? "session_00" : "fast",
        status: data.status,
        final_answer: { answer: data.answer },
        retry_token: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setLoading(false);
      setPolling(true);
      return;
    }

    setLoading(false);
    setPolling(true);
  }, [draft, loading, selectedModel, sessionId]);

  useEffect(() => {
    if (!runId || !polling) return;
    const currentRunId = runId;

    let cancelled = false;
    let timer: number | null = null;

    async function tick(afterSeq: number) {
      if (cancelled) return;
      const [runRes, eventsRes] = await Promise.all([
        fetchOpsRun(currentRunId),
        fetchOpsRunEvents(currentRunId, afterSeq),
      ]);

      if (cancelled) return;

      if (runRes) setRun(runRes);
      let latestSeq = afterSeq;
      if (eventsRes?.events.length) {
        setEvents((prev) => mergeOpsEvents(prev, eventsRes.events));
        latestSeq = Math.max(...eventsRes.events.map((e) => e.seq));
      }

      const stillActive = runRes ? isRunActive(runRes.status) : false;
      if (stillActive) {
        timer = window.setTimeout(() => void tick(latestSeq), POLL_INTERVAL_MS);
      } else {
        setPolling(false);
        onRunComplete?.(currentRunId);
      }
    }

    void tick(0);

    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [runId, polling, onRunComplete]);

  const finalAnswer = extractOpsFinalAnswer(events) || (run?.final_answer?.answer as string) || "";
  const runComplete = isOpsRunComplete({
    status: run?.status ?? null,
    loading,
    polling,
  });
  const showFinalAnswer = runComplete && Boolean(finalAnswer.trim());

  const isDeep = run?.route === "deep";
  const isReact = run?.route === "react";
  const modelFallbackSteps = extractOpsModelFallbackChain(events);
  const llmModelsUsed = extractOpsLlmModelsUsed(events);
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
  const isThinking = loading || polling || (run ? isRunActive(run.status) : false);

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
          {sessionId ? (
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
            {runId ? `run: ${runId}` : "未发起运行"}
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

      {showFinalAnswer ? (
        <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
          <div className="border-b border-[color:var(--color-border)] px-4 py-3">
            <div className="font-serif text-sm text-[#2c2c2c]">最终答案</div>
            {run?.status ? (
              <div className="mt-0.5 text-[11px] text-slate-500">
                run 已结束 · status={run.status}
              </div>
            ) : null}
          </div>
          <div className="px-4 py-4">
            <div className="whitespace-pre-wrap text-sm text-slate-800">{finalAnswer}</div>
          </div>
        </section>
      ) : null}

      {showRunEventsSection ? (
        <OpsCollapsibleSection
          title={runEventsTitle}
          subtitle={runEventsSubtitle}
          expanded={eventsExpanded}
          onExpandedChange={setEventsExpanded}
          actions={
            events.length > 0 ? (
              <button
                type="button"
                onClick={() => void copyTextToClipboard(serializeOpsEventsForCopy(events))}
                className="shrink-0 rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300"
              >
                复制全部
              </button>
            ) : null
          }
        >
          {isDeep ? (
            events.length === 0 ? (
              isThinking ? (
                <OpsThinkingHint />
              ) : (
                <p className="text-[12px] leading-relaxed text-slate-500">{runEventsEmptyHint}</p>
              )
            ) : (
              <ThinkingChainTimeline events={events} showCopyButtons={false} />
            )
          ) : isReact ? (
            events.length === 0 ? (
              isThinking ? (
                <OpsThinkingHint />
              ) : (
                <p className="text-[12px] leading-relaxed text-slate-500">{runEventsEmptyHint}</p>
              )
            ) : (
              <ul className="space-y-2">
                {events.map((e) => (
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
          ) : events.length === 0 ? (
            isThinking ? (
              <OpsThinkingHint />
            ) : (
              <p className="text-[12px] leading-relaxed text-slate-500">{runEventsEmptyHint}</p>
            )
          ) : (
            <ul className="space-y-2">
              {events.map((e) => (
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
