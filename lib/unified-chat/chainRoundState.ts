import type { ChainEvent } from "@/components/chain-chat/types";

export type ChainSseAppendArgs = {
  event: ChainEvent;
  serverRunFromMeta: string | null;
  currentRunId: string;
};

/** 本轮占位 run_id 下的 user.message */
export function createUserMessageEvent(localRunId: string, query: string): ChainEvent {
  const trimmed = query.trim();
  return {
    type: "user.message",
    ts: Date.now(),
    run_id: localRunId,
    step_id: "user",
    payload: { text: trimmed },
  };
}

/**
 * 追加单条 chain SSE 事件；meta.run_id 切换时重写占位 run_id 上的事件。
 */
export function appendChainSseToEvents(
  prev: ChainEvent[],
  args: ChainSseAppendArgs,
  localRunId: string,
): ChainEvent[] {
  const { event: ev, serverRunFromMeta: srvMeta } = args;
  const base =
    srvMeta && srvMeta !== localRunId
      ? prev.map((e) => (e.run_id === localRunId ? { ...e, run_id: srvMeta } : e))
      : prev;
  return [...base, ev];
}

export type TimelineFilterFlags = {
  debugRouter: boolean;
  debugLlmPrompts: boolean;
};

/** ChainTimeline 消费：按 debug 开关过滤（保留 SSE 到达序） */
export function filterTimelineEvents(events: ChainEvent[], flags: TimelineFilterFlags): ChainEvent[] {
  let xs = events;
  if (!flags.debugRouter) {
    xs = xs.filter((e) => e.type !== "router.evidence.details" && e.type !== "agent.intent");
  }
  if (!flags.debugLlmPrompts) {
    xs = xs.filter((e) => e.type !== "agent.debug.llm_prompts");
  }
  return xs;
}

/** 关闭 debug 时从累积列表移除调试类节点 */
export function stripDebugRouterEvents(prev: ChainEvent[]): ChainEvent[] {
  return prev.filter((e) => e.type !== "router.evidence.details" && e.type !== "agent.intent");
}

export function stripDebugLlmPromptEvents(prev: ChainEvent[]): ChainEvent[] {
  return prev.filter((e) => e.type !== "agent.debug.llm_prompts");
}
