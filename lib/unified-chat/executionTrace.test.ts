import { describe, expect, it } from "vitest";

import type { ChainEvent } from "@/components/chain-chat/types";
import { buildExecutionTraceSections } from "@/lib/unified-chat/executionTrace";
import { createUserMessageEvent } from "@/lib/unified-chat/chainRoundState";

describe("buildExecutionTraceSections", () => {
  it("builds llm_block from start/delta/end sequence", () => {
    const runId = "r1";
    const events: ChainEvent[] = [
      createUserMessageEvent(runId, "q"),
      {
        type: "agent.llm.start",
        ts: 1,
        run_id: runId,
        step_id: "s1",
        payload: { phase: "rag_generate" },
      },
      {
        type: "agent.llm.delta",
        ts: 2,
        run_id: runId,
        step_id: "s1",
        payload: { text: "Hello" },
      },
      {
        type: "agent.llm.end",
        ts: 3,
        run_id: runId,
        step_id: "s1",
        payload: { ok: true },
      },
    ];
    const sections = buildExecutionTraceSections(events);
    expect(sections).toHaveLength(1);
    expect(sections[0]).toMatchObject({
      kind: "llm_block",
      phase: "rag_generate",
      body: "Hello",
      ok: true,
    });
  });

  it("includes router.decision as router section", () => {
    const runId = "r1";
    const events: ChainEvent[] = [
      {
        type: "router.decision",
        ts: 1,
        run_id: runId,
        step_id: "router",
        payload: { final_mode: "rag" },
      },
    ];
    const sections = buildExecutionTraceSections(events);
    expect(sections[0]).toEqual({ kind: "router", finalMode: "rag" });
  });
});
