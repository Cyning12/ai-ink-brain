"use client";

import { useCallback, useEffect, useState } from "react";

import {
  extractOpsFinalAnswer,
  fetchOpsRun,
  fetchOpsRunEvents,
  formatOpsEventSummary,
  isRunActive,
  mergeOpsEvents,
  sendOpsChatMessage,
  type OpsRun,
  type OpsRunEvent,
} from "@/lib/ops/chat";

const POLL_INTERVAL_MS = 1200;

export function OpsChatClient() {
  const [draft, setDraft] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [run, setRun] = useState<OpsRun | null>(null);
  const [events, setEvents] = useState<OpsRunEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const handleSend = useCallback(async () => {
    const message = draft.trim();
    if (!message || loading) return;

    setLoading(true);
    setError(null);
    setRun(null);
    setEvents([]);
    setRunId(null);
    setPolling(false);

    const result = await sendOpsChatMessage(message);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const { data } = result;
    setRunId(data.run_id);

    if (data.route === "fast" && typeof data.answer === "string") {
      setRun({
        id: data.run_id,
        repo_id: "",
        session_id: null,
        query: message,
        route: "fast",
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
  }, [draft, loading]);

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
      }
    }

    void tick(0);

    return () => {
      cancelled = true;
      if (timer != null) window.clearTimeout(timer);
    };
  }, [runId, polling]);

  const finalAnswer = extractOpsFinalAnswer(events) || (run?.final_answer?.answer as string) || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Ops Chat
          </h1>
          <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
            基于 ops_run_events 的 Orchestrator 对话 · after_seq 增量轮询
          </p>
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

      {finalAnswer ? (
        <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
          <div className="border-b border-[color:var(--color-border)] px-4 py-3">
            <div className="font-serif text-sm text-[#2c2c2c]">最终答案</div>
          </div>
          <div className="px-4 py-4">
            <div className="whitespace-pre-wrap text-sm text-slate-800">{finalAnswer}</div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-[color:var(--color-border)] bg-white/40">
        <div className="border-b border-[color:var(--color-border)] px-4 py-3">
          <div className="font-serif text-sm text-[#2c2c2c]">运行事件</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            seq 递增 · 按 after_seq 增量合并
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto px-4 py-3">
          {events.length === 0 ? (
            <p className="text-[12px] leading-relaxed text-slate-500">
              {loading || polling ? "等待事件流…" : "发送问题后，此处展示 ops_run_events 时间线。"}
            </p>
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
        </div>
      </section>
    </div>
  );
}
