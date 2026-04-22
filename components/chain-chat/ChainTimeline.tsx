"use client";

import type { ChainEvent } from "@/components/chain-chat/types";
import { ChainEventCard } from "@/components/chain-chat/ChainEventCard";

type Props = {
  events: ChainEvent[];
};

export function ChainTimeline({ events }: Props) {
  const sorted = [...events].sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0));
  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/40 p-4 text-sm text-slate-500">
        暂无事件。请先发送一次问题。
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {sorted.map((e) => (
        <ChainEventCard key={`${e.run_id}:${e.step_id}:${e.type}:${e.ts}`} event={e} />
      ))}
    </div>
  );
}

