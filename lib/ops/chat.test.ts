import { describe, expect, it } from "vitest";

import {
  extractOpsFinalAnswer,
  isRunActive,
  mergeOpsEvents,
  type OpsRunEvent,
} from "@/lib/ops/chat";

function makeEvent(seq: number, eventType: string, payload: Record<string, unknown> = {}): OpsRunEvent {
  return {
    run_id: "run-1",
    seq,
    ts_ms: seq * 1000,
    node_id: null,
    agent_role: "orchestrator",
    event_type: eventType,
    payload,
  };
}

describe("mergeOpsEvents", () => {
  it("按 seq 合并并排序", () => {
    const existing = [makeEvent(1, "run.start"), makeEvent(3, "router.decision")];
    const incoming = [makeEvent(2, "agent.tool.result"), makeEvent(3, "router.decision", { route: "deep" })];
    const merged = mergeOpsEvents(existing, incoming);
    expect(merged.map((e) => e.seq)).toEqual([1, 2, 3]);
    expect(merged.find((e) => e.seq === 3)?.payload.route).toBe("deep");
  });

  it("去重保留最新", () => {
    const existing = [makeEvent(1, "run.start")];
    const incoming = [makeEvent(1, "run.start")];
    expect(mergeOpsEvents(existing, incoming)).toHaveLength(1);
  });
});

describe("extractOpsFinalAnswer", () => {
  it("从 final.answer 提取 answer", () => {
    const events = [
      makeEvent(1, "run.start"),
      makeEvent(2, "final.answer", { answer: "最终答案" }),
    ];
    expect(extractOpsFinalAnswer(events)).toBe("最终答案");
  });

  it("优先取最后一条 final.answer", () => {
    const events = [
      makeEvent(1, "final.answer", { answer: "旧答案" }),
      makeEvent(2, "final.answer", { answer: "新答案" }),
    ];
    expect(extractOpsFinalAnswer(events)).toBe("新答案");
  });

  it("无 final.answer 返回空串", () => {
    expect(extractOpsFinalAnswer([makeEvent(1, "run.start")])).toBe("");
  });
});

describe("isRunActive", () => {
  it("running / queued 为活跃", () => {
    expect(isRunActive("running")).toBe(true);
    expect(isRunActive("queued")).toBe(true);
  });

  it("done / failed / partial 为非活跃", () => {
    expect(isRunActive("done")).toBe(false);
    expect(isRunActive("failed")).toBe(false);
    expect(isRunActive("partial")).toBe(false);
  });
});
