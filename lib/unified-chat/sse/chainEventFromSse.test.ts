import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { applyChainSseFrame, extractServerRunIdFromChainRaw } from "@/lib/unified-chat/sse/applyChainSseFrame";
import { chainEventFromSse } from "@/lib/unified-chat/sse/chainEventFromSse";

const fixtures = JSON.parse(
  readFileSync(path.join(__dirname, "fixtures", "chain-meta-and-tool.json"), "utf8"),
) as Record<string, Record<string, unknown>>;

describe("chainEventFromSse", () => {
  it("accepts whitelisted tool.call.start", () => {
    const ev = chainEventFromSse({
      runId: "local-run",
      raw: fixtures.toolStart,
      fallbackStepId: "chain",
    });
    expect(ev?.type).toBe("tool.call.start");
    expect(ev?.run_id).toBe("local-run");
  });

  it("rejects unknown chain.type (FP-BAD-SSE)", () => {
    expect(
      chainEventFromSse({
        runId: "r",
        raw: fixtures.unknownType,
        fallbackStepId: "chain",
      }),
    ).toBeNull();
  });

  it("rejects agent.llm.delta without text", () => {
    expect(
      chainEventFromSse({
        runId: "r",
        raw: fixtures.badDelta,
        fallbackStepId: "chain",
      }),
    ).toBeNull();
  });

  it("accepts agent.clarify with manifest min keys (P1-4 §4.3)", () => {
    const ev = chainEventFromSse({
      runId: "run-demo-clarify",
      raw: fixtures.agentClarifyOk,
      fallbackStepId: "chain",
    });
    expect(ev?.type).toBe("agent.clarify");
    expect(ev?.run_id).toBe("run-demo-clarify");
    expect(ev?.step_id).toBe("a1_clarify");
    expect(ev?.payload).toMatchObject({
      step_number: 1,
      message: "待您澄清（低置信度）",
      prompt_for_user: expect.stringContaining("请补充"),
    });
  });

  it("rejects agent.clarify missing prompt_for_user (策略 B)", () => {
    expect(
      chainEventFromSse({
        runId: "r",
        raw: fixtures.agentClarifyMissingPrompt,
        fallbackStepId: "chain",
      }),
    ).toBeNull();
  });

  it("rejects unknown agent.clarify variant type (策略 B)", () => {
    expect(
      chainEventFromSse({
        runId: "r",
        raw: fixtures.agentClarifyUnknownVariant,
        fallbackStepId: "chain",
      }),
    ).toBeNull();
  });
});

describe("applyChainSseFrame", () => {
  it("uses meta.payload.run_id as canonical run_id", () => {
    const applied = applyChainSseFrame({
      dataJson: fixtures.meta,
      currentRunId: "local-run",
    });
    expect(applied.kind).toBe("chain");
    if (applied.kind !== "chain") return;
    expect(applied.serverRunFromMeta).toBe("server-run-abc");
    expect(applied.event.run_id).toBe("server-run-abc");
    expect(extractServerRunIdFromChainRaw(fixtures.meta)).toBe("server-run-abc");
  });

  it("returns parse_error for null JSON", () => {
    expect(applyChainSseFrame({ dataJson: null, currentRunId: "r" }).kind).toBe("parse_error");
  });
});
