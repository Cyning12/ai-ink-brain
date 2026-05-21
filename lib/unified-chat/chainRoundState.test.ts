import { describe, expect, it } from "vitest";

import type { ChainEvent } from "@/components/chain-chat/types";
import {
  appendChainSseToEvents,
  createUserMessageEvent,
  filterTimelineEvents,
  stripDebugLlmPromptEvents,
  stripDebugRouterEvents,
} from "@/lib/unified-chat/chainRoundState";

describe("createUserMessageEvent", () => {
  it("builds user.message with trimmed text", () => {
    const ev = createUserMessageEvent("run-local", "  hello  ");
    expect(ev.type).toBe("user.message");
    expect(ev.run_id).toBe("run-local");
    expect(ev.payload.text).toBe("hello");
  });
});

describe("appendChainSseToEvents", () => {
  const user = createUserMessageEvent("local-1", "q");

  it("appends chain event in order", () => {
    const chain: ChainEvent = {
      type: "agent.llm.start",
      ts: 2,
      run_id: "local-1",
      step_id: "s1",
      payload: { phase: "rag_generate" },
    };
    const next = appendChainSseToEvents(
      [user],
      { event: chain, serverRunFromMeta: null, currentRunId: "local-1" },
      "local-1",
    );
    expect(next).toHaveLength(2);
    expect(next[1]?.type).toBe("agent.llm.start");
  });

  it("remaps local run_id when meta provides server run_id", () => {
    const chain: ChainEvent = {
      type: "meta",
      ts: 3,
      run_id: "srv-9",
      step_id: "meta",
      payload: { run_id: "srv-9" },
    };
    const next = appendChainSseToEvents(
      [user],
      { event: chain, serverRunFromMeta: "srv-9", currentRunId: "local-1" },
      "local-1",
    );
    expect(next[0]?.run_id).toBe("srv-9");
    expect(next[1]?.run_id).toBe("srv-9");
  });
});

describe("filterTimelineEvents", () => {
  const events: ChainEvent[] = [
    createUserMessageEvent("r", "q"),
    {
      type: "agent.intent",
      ts: 1,
      run_id: "r",
      step_id: "i",
      payload: { tool: "rag", mode: "rag" },
    },
    {
      type: "agent.debug.llm_prompts",
      ts: 2,
      run_id: "r",
      step_id: "d",
      payload: {},
    },
    {
      type: "tool.call.start",
      ts: 3,
      run_id: "r",
      step_id: "t",
      payload: { tool: "rag" },
    },
  ];

  it("strips debug types when flags off", () => {
    const out = filterTimelineEvents(events, { debugRouter: false, debugLlmPrompts: false });
    expect(out.map((e) => e.type)).toEqual(["user.message", "tool.call.start"]);
  });

  it("keeps debug types when flags on", () => {
    const out = filterTimelineEvents(events, { debugRouter: true, debugLlmPrompts: true });
    expect(out).toHaveLength(4);
  });
});

describe("strip helpers", () => {
  it("stripDebugRouterEvents removes router debug rows", () => {
    const xs: ChainEvent[] = [
      {
        type: "agent.intent",
        ts: 1,
        run_id: "r",
        step_id: "i",
        payload: {},
      },
      {
        type: "router.evidence.details",
        ts: 2,
        run_id: "r",
        step_id: "e",
        payload: {},
      },
    ];
    expect(stripDebugRouterEvents(xs)).toHaveLength(0);
  });

  it("stripDebugLlmPromptEvents removes llm prompt debug rows", () => {
    const xs: ChainEvent[] = [
      {
        type: "agent.debug.llm_prompts",
        ts: 1,
        run_id: "r",
        step_id: "d",
        payload: {},
      },
    ];
    expect(stripDebugLlmPromptEvents(xs)).toHaveLength(0);
  });
});
