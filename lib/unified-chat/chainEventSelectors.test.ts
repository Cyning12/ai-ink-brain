import { describe, expect, it } from "vitest";

import type { ChainEvent } from "@/components/chain-chat/types";
import {
  extractAgentIntentObs,
  extractIntentPathObs,
} from "@/lib/unified-chat/chainEventSelectors";

describe("extractIntentPathObs", () => {
  it("parses optional path fields when present", () => {
    const obs = extractIntentPathObs({
      intent_path: "llm_retry",
      intent_attempt: 2,
      hints_arbitration: { applied: true, reason: "配置：站点人物须查 resume" },
      agent_step_routing: "agent_soft_timeout_v1",
    });
    expect(obs).toEqual({
      intent_path: "llm_retry",
      intent_attempt: 2,
      hints_arbitration: { applied: true, reason: "配置：站点人物须查 resume" },
      agent_step_routing: "agent_soft_timeout_v1",
    });
  });

  it("returns null-ish fields when optional keys missing", () => {
    const obs = extractIntentPathObs({ tool: "rag_search", mode: "rag" });
    expect(obs).toEqual({
      intent_path: null,
      intent_attempt: null,
      hints_arbitration: null,
      agent_step_routing: null,
    });
  });
});

describe("extractAgentIntentObs", () => {
  it("merges path obs from last agent.intent event", () => {
    const events: ChainEvent[] = [
      {
        type: "agent.intent",
        ts: 1,
        run_id: "r1",
        step_id: "intent",
        payload: {
          tool: "rag_search",
          mode: "rag",
          confidence: 0.9,
          cache: "miss",
          intent_path: "llm",
          intent_attempt: 1,
        },
      },
    ];
    const row = extractAgentIntentObs(events);
    expect(row?.tool).toBe("rag_search");
    expect(row?.path.intent_path).toBe("llm");
    expect(row?.path.intent_attempt).toBe(1);
  });

  it("does not throw on legacy payload without path keys", () => {
    const events: ChainEvent[] = [
      {
        type: "agent.intent",
        ts: 1,
        run_id: "r1",
        step_id: "intent",
        payload: {
          tool: "rag_search",
          mode: "rag",
          confidence: 0.5,
          cache: "hit",
          reasoning: "legacy",
          fallback: null,
          cache_key_hash: "",
          latency_ms: 12,
        },
      },
    ];
    expect(() => extractAgentIntentObs(events)).not.toThrow();
    expect(extractAgentIntentObs(events)?.path.intent_path).toBeNull();
  });
});
