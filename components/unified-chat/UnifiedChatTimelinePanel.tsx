"use client";

import type { ChainEvent } from "@/components/chain-chat/types";
import { ChainTimeline, chainTimelineExpandBtnClass } from "@/components/chain-chat/ChainTimeline";

type Props = {
  timelineEvents: ChainEvent[];
  timelineBatchNonce: number;
  timelineBatchOpen: boolean;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onCopy: () => void;
  copyLabel: string;
};

export function UnifiedChatTimelinePanel({
  timelineEvents,
  timelineBatchNonce,
  timelineBatchOpen,
  onExpandAll,
  onCollapseAll,
  onCopy,
  copyLabel,
}: Props) {
  return (
    <section className="flex min-h-[72vh] min-w-0 flex-col rounded-2xl border border-[color:var(--color-border)] bg-white/40">
      <div className="flex items-start justify-between gap-3 border-b border-[color:var(--color-border)] px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="font-serif text-sm text-[#2c2c2c]">Timeline</div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            vNext：SSE 到达序（含 agent.llm.*）；展开查看详情
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <button
            type="button"
            className={chainTimelineExpandBtnClass}
            onClick={() => void onCopy()}
            title="复制当前 Timeline 事件（JSON）"
          >
            {copyLabel}
          </button>
          {timelineEvents.length > 0 ? (
            <>
              <button type="button" className={chainTimelineExpandBtnClass} onClick={onExpandAll}>
                全部展开
              </button>
              <button type="button" className={chainTimelineExpandBtnClass} onClick={onCollapseAll}>
                全部收起
              </button>
            </>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
        <ChainTimeline
          events={timelineEvents}
          sortByTs={false}
          showExpandToolbar={false}
          batchExpandNonce={timelineBatchNonce}
          batchExpandOpen={timelineBatchOpen}
        />
      </div>
    </section>
  );
}
