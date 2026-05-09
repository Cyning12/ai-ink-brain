"use client";

import { useCallback, useState } from "react";

import type { ChainEvent } from "@/components/chain-chat/types";
import { ChainEventCard } from "@/components/chain-chat/ChainEventCard";

type Props = {
  events: ChainEvent[];
  /** 默认 true（兼容旧页）；Unified Chat vNext 传 false 以保留 SSE 到达序（见 SPEC §8.2） */
  sortByTs?: boolean;
  /** 列表内右上方工具条；与 batchExpandNonce 受控并存时，由父级在标题栏放按钮则置 false */
  showExpandToolbar?: boolean;
  /** 受控：与 batchExpandOpen 成对传入时，由父级递增 nonce 驱动批量展开/收起，且不渲染内部工具条 */
  batchExpandNonce?: number;
  batchExpandOpen?: boolean;
};

/** 同 ts 下多条 agent.llm.delta 会撞 key，须带序号 / part_index */
function stableTimelineKey(e: ChainEvent, index: number): string {
  const base = `${e.run_id}:${e.step_id}:${e.type}:${e.ts}`;
  if (e.type === "agent.llm.delta") {
    const pi = e.payload.part_index;
    const part =
      typeof pi === "number" && Number.isFinite(pi) ? String(Math.round(pi)) : "";
    return `${base}:p${part}:i${index}`;
  }
  if (e.type === "agent.debug.llm_prompts") {
    return `${base}:dbg:i${index}`;
  }
  return `${base}:i${index}`;
}

/** 标题栏 / 列表内「全部展开·收起」共用样式 */
export const chainTimelineExpandBtnClass =
  "shrink-0 rounded-lg border border-[color:var(--color-border)] bg-white/80 px-2 py-1 text-[11px] text-slate-700 hover:bg-white";

export function ChainTimeline({
  events,
  sortByTs = true,
  showExpandToolbar = true,
  batchExpandNonce: controlledNonce,
  batchExpandOpen: controlledOpen,
}: Props) {
  const sorted = sortByTs ? [...events].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0)) : events;
  const [innerNonce, setInnerNonce] = useState(0);
  const [innerOpen, setInnerOpen] = useState(false);

  const controlled = controlledNonce !== undefined && controlledOpen !== undefined;
  const batchNonce = controlled ? controlledNonce : innerNonce;
  const batchOpen = controlled ? controlledOpen : innerOpen;

  const expandAll = useCallback(() => {
    if (controlled) return;
    setInnerOpen(true);
    setInnerNonce((n) => n + 1);
  }, [controlled]);

  const collapseAll = useCallback(() => {
    if (controlled) return;
    setInnerOpen(false);
    setInnerNonce((n) => n + 1);
  }, [controlled]);

  const showInlineToolbar = showExpandToolbar && !controlled;

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 p-4 text-sm text-slate-500">
        暂无事件。请先发送一次问题。
      </div>
    );
  }
  return (
    <div>
      {showInlineToolbar ? (
        <div className="sticky top-0 z-[1] -mx-1 mb-2 flex justify-end gap-1.5 bg-white/90 px-1 py-1 backdrop-blur-sm">
          <button type="button" className={chainTimelineExpandBtnClass} onClick={expandAll}>
            全部展开
          </button>
          <button type="button" className={chainTimelineExpandBtnClass} onClick={collapseAll}>
            全部收起
          </button>
        </div>
      ) : null}
      <div className="space-y-3">
        {sorted.map((e, idx) => (
          <ChainEventCard
            key={`${idx}-${stableTimelineKey(e, idx)}`}
            event={e}
            batchExpandNonce={batchNonce}
            batchExpandOpen={batchOpen}
          />
        ))}
      </div>
    </div>
  );
}

