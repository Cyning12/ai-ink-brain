"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";

import type { ChainEvent } from "@/components/chain-chat/types";
import {
  appendChainSseToEvents,
  createUserMessageEvent,
  filterTimelineEvents,
  stripDebugLlmPromptEvents,
  stripDebugRouterEvents,
  type ChainSseAppendArgs,
} from "@/lib/unified-chat/chainRoundState";
import {
  buildExecutionTraceSections,
  type ExecSection,
} from "@/lib/unified-chat/executionTrace";
import {
  extractAgentIntentObs,
  extractMessagesFromEvents,
  extractRouterDecision,
  extractRouterEvidence,
  extractUserQueryText,
} from "@/lib/unified-chat/chainEventSelectors";
import {
  useUnifiedChat,
  type UnifiedChatPreferMode,
  type UseUnifiedChatOptions,
} from "@/lib/unified-chat/hooks/useUnifiedChat";
import type { ChatbiDonePayload } from "@/lib/unified-chat/transport/types";

export type StreamLastDone = {
  ok: boolean;
  mode: string;
  run_id: string;
  session_id: string;
  request_id: string;
  persist?: Record<string, unknown>;
};

export type UseUnifiedChatStreamOptions = Omit<UseUnifiedChatOptions, "callbacks"> & {
  debugRouter: boolean;
  debugLlmPrompts: boolean;
  /** chain 帧到达时（含 plan.preview 等页面侧效应） */
  onChainEventSideEffect?: (event: ChainEvent, events: ChainEvent[]) => void;
};

/**
 * Phase 2：SDK 正文流 + Timeline chain 状态机（单一 reducer，无页面内联 SSE read loop）。
 */
export function useUnifiedChatStream(options: UseUnifiedChatStreamOptions) {
  const {
    sessionId,
    prefer,
    debugRouter,
    debugLlmPrompts,
    headers,
    onError,
    onChainEventSideEffect,
  } = options;

  const [events, setEvents] = useState<ChainEvent[]>([]);
  const [activeRequestId, setActiveRequestId] = useState("");
  const [lastDone, setLastDone] = useState<StreamLastDone | null>(null);

  const roundRunIdRef = useRef("");
  const roundEventsRef = useRef<ChainEvent[]>([]);
  const streamLastDoneRef = useRef<ChatbiDonePayload | null>(null);
  const parseErrorCountRef = useRef(0);

  const handleChainSse = useCallback(
    (args: ChainSseAppendArgs) => {
      const localRunId = roundRunIdRef.current;
      setEvents((prev) => {
        const next = appendChainSseToEvents(prev, args, localRunId);
        roundEventsRef.current = next;
        return next;
      });
      onChainEventSideEffect?.(args.event, roundEventsRef.current);
    },
    [onChainEventSideEffect],
  );

  const unifiedChat = useUnifiedChat({
    sessionId,
    prefer,
    debugRouter,
    debugLlmPrompts,
    headers,
    onError,
    callbacks: {
      onChainEvent: handleChainSse,
      onParseError: () => {
        parseErrorCountRef.current += 1;
        console.debug("[UnifiedChat SSE] chain 帧跳过", parseErrorCountRef.current);
      },
      onDone: (done) => {
        if (!done) return;
        streamLastDoneRef.current = done;
        if (done.request_id.trim()) setActiveRequestId(done.request_id.trim());
        setLastDone({
          ok: done.ok,
          mode: done.mode,
          run_id: done.run_id,
          session_id: done.session_id,
          request_id: done.request_id,
          ...(done.persist ? { persist: done.persist } : {}),
        });
      },
    },
  });

  /** 展示用事件：debug 关闭时过滤（不 mutate 原始累积，便于重新打开 debug） */
  const visibleEvents = useMemo(() => {
    let xs = events;
    if (!debugRouter) xs = stripDebugRouterEvents(xs);
    if (!debugLlmPrompts) xs = stripDebugLlmPromptEvents(xs);
    return xs;
  }, [events, debugRouter, debugLlmPrompts]);

  const timelineEvents = useMemo(
    () => filterTimelineEvents(visibleEvents, { debugRouter, debugLlmPrompts }),
    [visibleEvents, debugRouter, debugLlmPrompts],
  );

  const messages = useMemo(() => extractMessagesFromEvents(visibleEvents), [visibleEvents]);
  const routerDecision = useMemo(() => extractRouterDecision(visibleEvents), [visibleEvents]);
  const routerEvidence = useMemo(() => extractRouterEvidence(visibleEvents), [visibleEvents]);
  const agentIntentObs = useMemo(() => extractAgentIntentObs(visibleEvents), [visibleEvents]);
  const queryTextTrace = useMemo(() => extractUserQueryText(visibleEvents), [visibleEvents]);
  const execSections: ExecSection[] = useMemo(
    () => buildExecutionTraceSections(visibleEvents),
    [visibleEvents],
  );

  const beginRound = useCallback((query: string) => {
    parseErrorCountRef.current = 0;
    streamLastDoneRef.current = null;
    setActiveRequestId("");
    setLastDone(null);

    const runId = crypto.randomUUID();
    roundRunIdRef.current = runId;
    const userEvent = createUserMessageEvent(runId, query);
    roundEventsRef.current = [userEvent];
    setEvents([userEvent]);
    return runId;
  }, []);

  const flushRoundEvents = useCallback((): ChainEvent[] => {
    let latest: ChainEvent[] = [];
    flushSync(() => {
      setEvents((prev) => {
        latest = prev;
        return prev;
      });
    });
    roundEventsRef.current = latest;
    return latest;
  }, []);

  const clearEvents = useCallback(() => {
    roundEventsRef.current = [];
    setEvents([]);
  }, []);

  const resetStreamMeta = useCallback(() => {
    parseErrorCountRef.current = 0;
    streamLastDoneRef.current = null;
    setActiveRequestId("");
    setLastDone(null);
  }, []);

  return {
    ...unifiedChat,
    prefer: prefer as UnifiedChatPreferMode,
    events,
    timelineEvents,
    messages,
    routerDecision,
    routerEvidence,
    agentIntentObs,
    queryTextTrace,
    execSections,
    activeRequestId,
    lastDone,
    streamLastDoneRef,
    parseErrorCountRef,
    roundEventsRef,
    beginRound,
    flushRoundEvents,
    clearEvents,
    resetStreamMeta,
  };
}
