import { describe, expect, it } from "vitest";

import {
  formatOpsEventSummary,
  isOpsRunComplete,
  isReactEventType,
  serializeOpsEventForCopy,
  type OpsRunEvent,
} from "@/lib/ops/chat";

describe("isOpsRunComplete", () => {
  it("运行中不展示终答", () => {
    expect(isOpsRunComplete({ status: "running", loading: false, polling: false })).toBe(false);
    expect(isOpsRunComplete({ status: "done", loading: false, polling: true })).toBe(false);
    expect(isOpsRunComplete({ status: "done", loading: true, polling: false })).toBe(false);
  });

  it("结束后可展示终答", () => {
    expect(isOpsRunComplete({ status: "done", loading: false, polling: false })).toBe(true);
    expect(isOpsRunComplete({ status: "partial", loading: false, polling: false })).toBe(true);
  });
});

describe("serializeOpsEventForCopy", () => {
  it("输出含 seq 与 payload 的 JSON", () => {
    const event: OpsRunEvent = {
      run_id: "r1",
      seq: 3,
      ts_ms: 1,
      node_id: null,
      agent_role: "orchestrator",
      event_type: "run.start",
      payload: { route: "deep" },
    };
    const text = serializeOpsEventForCopy(event);
    expect(text).toContain('"seq": 3');
    expect(text).toContain('"route": "deep"');
  });
});

describe("formatOpsEventSummary · ReAct", () => {
  it("react_step 含步号", () => {
    const summary = formatOpsEventSummary({
      run_id: "r1",
      seq: 1,
      ts_ms: 1,
      node_id: null,
      agent_role: "react",
      event_type: "agent.react_step",
      payload: { step: 2, thought: "需要查 issue 列表" },
    });
    expect(summary).toContain("第 2 步");
    expect(summary).toContain("需要查 issue");
  });
});

describe("isReactEventType", () => {
  it("识别 ReAct event", () => {
    expect(isReactEventType("agent.react_step")).toBe(true);
    expect(isReactEventType("final.answer")).toBe(false);
  });
});
