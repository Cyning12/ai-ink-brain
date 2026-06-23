"use client";

import { useMemo } from "react";

import {
  formatOpsEventSummary,
  isReviewEventType,
  partitionThinkingChain,
  type OpsCitation,
  type OpsRunEvent,
  type ThinkingChainPhase,
} from "@/lib/ops/chat";

function PhaseBadge({ phase }: { phase: ThinkingChainPhase }) {
  const styles: Record<ThinkingChainPhase, string> = {
    analysis: "bg-amber-50 text-amber-800 border-amber-200",
    review: "bg-sky-50 text-sky-800 border-sky-200",
    final: "bg-emerald-50 text-emerald-800 border-emerald-200",
    other: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const labels: Record<ThinkingChainPhase, string> = {
    analysis: "分析",
    review: "Review",
    final: "最终答案",
    other: "其他",
  };
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-medium ${styles[phase]}`}
    >
      {labels[phase]}
    </span>
  );
}

function CitationList({ citations }: { citations: OpsCitation[] }) {
  if (!citations.length) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="text-[10px] font-medium text-slate-500">引用</div>
      <ul className="space-y-1">
        {citations.map((c) => (
          <li key={c.url} className="text-[11px]">
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-indigo-700 hover:underline"
            >
              <span className="font-mono">#{c.number}</span>
              <span className="truncate max-w-[40ch] text-slate-600">{c.url}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewCard({
  rule,
  message,
  attempt,
  status,
}: {
  rule?: string;
  message?: string;
  attempt?: number;
  status: "pass" | "fail" | "partial";
}) {
  const statusStyles = {
    pass: "border-emerald-200 bg-emerald-50/60 text-emerald-900",
    fail: "border-rose-200 bg-rose-50/60 text-rose-900",
    partial: "border-amber-200 bg-amber-50/60 text-amber-900",
  };
  const statusLabels = {
    pass: "通过",
    fail: "失败",
    partial: "部分通过",
  };
  return (
    <div className={`mt-2 rounded-lg border px-3 py-2 ${statusStyles[status]}`}>
      <div className="flex items-center gap-2 text-[11px] font-medium">
        <span>Review {statusLabels[status]}</span>
        {rule ? <span className="font-mono opacity-70">· {rule}</span> : null}
        {typeof attempt === "number" ? (
          <span className="font-mono opacity-70">· attempt {attempt}</span>
        ) : null}
      </div>
      {message ? (
        <p className="mt-1 text-[11px] leading-relaxed opacity-90">{message}</p>
      ) : null}
    </div>
  );
}

function AnalysisCard({
  reasoning,
  suggestion,
  confidence,
  issueNumber,
  citations,
}: {
  reasoning?: string;
  suggestion?: string;
  confidence?: number;
  issueNumber?: number;
  citations?: OpsCitation[];
}) {
  return (
    <div className="mt-2 rounded-lg border border-amber-200/80 bg-amber-50/40 px-3 py-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-amber-900/70">
        {issueNumber != null ? (
          <span className="font-mono">Issue #{issueNumber}</span>
        ) : null}
        {confidence != null ? (
          <span className="font-mono">置信度 {confidence.toFixed(2)}</span>
        ) : null}
      </div>
      {reasoning ? (
        <div className="mt-2">
          <div className="text-[10px] font-medium text-slate-500">推理</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-800">{reasoning}</p>
        </div>
      ) : null}
      {suggestion ? (
        <div className="mt-2">
          <div className="text-[10px] font-medium text-slate-500">建议</div>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-800">{suggestion}</p>
        </div>
      ) : null}
      {citations?.length ? <CitationList citations={citations} /> : null}
    </div>
  );
}

export function ThinkingChainTimeline({ events }: { events: OpsRunEvent[] }) {
  const chain = useMemo(() => partitionThinkingChain(events), [events]);

  if (!events.length) {
    return (
      <p className="text-[12px] leading-relaxed text-slate-500">
        发送问题后，此处展示 Deep 思考链时间线。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {chain.map((item) => {
        const { event, phase, toolResult, review } = item;
        const isToolResult = event.event_type === "agent.tool.result";
        const isReview = isReviewEventType(event.event_type);

        let reviewStatus: "pass" | "fail" | "partial" | undefined;
        if (event.event_type === "review.pass") reviewStatus = "pass";
        else if (event.event_type === "review.fail") reviewStatus = "fail";
        else if (event.event_type === "review.partial") reviewStatus = "partial";

        return (
          <li
            key={event.seq}
            className="rounded-lg border border-slate-200/80 bg-[#f9f9f7]/80 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span className="font-mono">seq {event.seq}</span>
              <span>·</span>
              <span className="font-mono text-slate-700">{event.agent_role}</span>
              <span>·</span>
              <span className="font-mono text-indigo-900/80">{event.event_type}</span>
              <PhaseBadge phase={phase} />
            </div>
            <div className="mt-1 text-slate-800">{formatOpsEventSummary(event)}</div>

            {isToolResult && toolResult ? (
              <AnalysisCard
                reasoning={toolResult.reasoning}
                suggestion={toolResult.suggestion}
                confidence={toolResult.confidence}
                issueNumber={toolResult.issue_number}
                citations={toolResult.citations}
              />
            ) : null}

            {isReview && reviewStatus ? (
              <ReviewCard
                rule={review?.rule}
                message={review?.message}
                attempt={review?.attempt}
                status={reviewStatus}
              />
            ) : null}

            {Object.keys(event.payload ?? {}).length > 0 && !isToolResult && !isReview ? (
              <pre className="mt-2 max-h-[24vh] overflow-auto whitespace-pre-wrap break-words rounded border border-slate-200/60 bg-white/80 p-2 font-mono text-[10px] text-slate-700">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
