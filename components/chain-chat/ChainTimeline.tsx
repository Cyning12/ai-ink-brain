"use client";

import type { ChainEvent } from "@/components/chain-chat/types";
import { ChainEventCard } from "@/components/chain-chat/ChainEventCard";

type Props = {
  events: ChainEvent[];
  /** 默认 true（兼容旧页）；Unified Chat vNext 传 false 以保留 SSE 到达序（见 SPEC §8.2） */
  sortByTs?: boolean;
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
  return `${base}:i${index}`;
}

export function ChainTimeline({ events, sortByTs = true }: Props) {
  const sorted = sortByTs ? [...events].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0)) : events;
  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 p-4 text-sm text-slate-500">
        暂无事件。请先发送一次问题。
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {sorted.map((e, idx) => (
        <ChainEventCard key={`${idx}-${stableTimelineKey(e, idx)}`} event={e} />
      ))}
    </div>
  );
}

