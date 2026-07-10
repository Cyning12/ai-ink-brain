import { describe, expect, it } from "vitest";

import {
  appendOpsChatTurn,
  createOpsChatTurn,
  extractOpsFinalAnswer,
  findCheckpointResumeEvent,
  findClarifyEvent,
  findReactMaxStepsEvent,
  formatOpsEventSummary,
  isOpsRunComplete,
  isReactEventType,
  parseAgentToolResultPayload,
  parseCheckpointResumePayload,
  parseClarifyPayload,
  parseHandoffPayload,
  parseReviewV1Payload,
  serializeOpsEventForCopy,
  updateOpsChatTurn,
  type OpsChatTurn,
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

describe("parseAgentToolResultPayload", () => {
  it("解析 citations 数组", () => {
    const parsed = parseAgentToolResultPayload({
      issue_number: 545,
      confidence: 0.92,
      reasoning: "原因",
      suggestion: "建议",
      citations: [{ number: 1, url: "https://example.com" }],
    });
    expect(parsed.issue_number).toBe(545);
    expect(parsed.confidence).toBeCloseTo(0.92);
    expect(parsed.citations).toHaveLength(1);
    expect(parsed.citations?.[0].url).toBe("https://example.com");
  });
});

describe("schema v1 parsers", () => {
  it("parseHandoffPayload 读取 schema_version 与路由", () => {
    const payload = {
      schema_version: "v1",
      from_route: "router",
      to_route: "deep",
      intent: "issue_contribution",
      slots: { issue_number: 545 },
      agent: "issue_analyst",
    };
    const parsed = parseHandoffPayload(payload);
    expect(parsed.schema_version).toBe("v1");
    expect(parsed.from_route).toBe("router");
    expect(parsed.to_route).toBe("deep");
    expect(parsed.agent).toBe("issue_analyst");
  });

  it("parseReviewV1Payload 读取 verdict/rule/attempt", () => {
    const payload = {
      schema_version: "v1",
      verdict: "pass",
      rule: "V1_EXISTS",
      message: "ok",
      attempt: 1,
    };
    const parsed = parseReviewV1Payload(payload);
    expect(parsed.schema_version).toBe("v1");
    expect(parsed.verdict).toBe("pass");
    expect(parsed.rule).toBe("V1_EXISTS");
    expect(parsed.attempt).toBe(1);
  });

  it("parseClarifyPayload 读取 clarify_question", () => {
    const parsed = parseClarifyPayload({
      schema_version: "v1",
      clarify_question: "你想比较哪方面？",
      session_id: "sess-1",
    });
    expect(parsed.clarify_question).toBe("你想比较哪方面？");
    expect(parsed.session_id).toBe("sess-1");
  });

  it("parseCheckpointResumePayload 读取 from_run_id 与 step", () => {
    const parsed = parseCheckpointResumePayload({
      from_run_id: "run-prev",
      step: 3,
      session_id: "sess-1",
    });
    expect(parsed.from_run_id).toBe("run-prev");
    expect(parsed.step).toBe(3);
    expect(parsed.session_id).toBe("sess-1");
  });
});

describe("formatOpsEventSummary · schema v1 / P1 事件", () => {
  const base: OpsRunEvent = {
    run_id: "r1",
    seq: 1,
    ts_ms: 1,
    node_id: null,
    agent_role: "orchestrator",
    event_type: "handoff",
    payload: {
      schema_version: "v1",
      from_route: "router",
      to_route: "deep",
      intent: "issue_contribution",
      slots: {},
      agent: "issue_analyst",
    },
  };

  it("handoff 显示路由与意图", () => {
    expect(formatOpsEventSummary(base)).toContain("router → deep");
    expect(formatOpsEventSummary(base)).toContain("issue_contribution");
  });

  it("review v1 显示 verdict 与 rule", () => {
    const summary = formatOpsEventSummary({
      ...base,
      event_type: "review",
      payload: { schema_version: "v1", verdict: "fail", rule: "V2_URL", attempt: 2 },
    });
    expect(summary).toContain("fail");
    expect(summary).toContain("V2_URL");
  });

  it("clarify.asked 显示问题", () => {
    const summary = formatOpsEventSummary({
      ...base,
      event_type: "clarify.asked",
      payload: { schema_version: "v1", clarify_question: "你想比较哪方面？" },
    });
    expect(summary).toContain("你想比较哪方面？");
  });

  it("checkpoint.resume 显示来源 run 与步号", () => {
    const summary = formatOpsEventSummary({
      ...base,
      event_type: "checkpoint.resume",
      payload: { from_run_id: "run-prev", step: 3 },
    });
    expect(summary).toContain("run-prev");
    expect(summary).toContain("第 3 步");
  });

  it("checkpoint.save_failed 显示友好文案", () => {
    const summary = formatOpsEventSummary({
      ...base,
      event_type: "checkpoint.save_failed",
      payload: {},
    });
    expect(summary).toContain("Checkpoint 保存失败");
  });

  it("checkpoint.corrupted 显示友好文案", () => {
    const summary = formatOpsEventSummary({
      ...base,
      event_type: "checkpoint.corrupted",
      payload: {},
    });
    expect(summary).toContain("损坏");
  });

  it("artifact.write_failed 显示 kind", () => {
    const summary = formatOpsEventSummary({
      ...base,
      event_type: "artifact.write_failed",
      payload: { kind: "react_summary", schema_version: "v1" },
    });
    expect(summary).toContain("Artifact 写入失败");
    expect(summary).toContain("react_summary");
  });

  it("schema_version 识别", () => {
    const summary = formatOpsEventSummary({
      ...base,
      payload: { schema_version: "v1", from_route: "x", to_route: "y", intent: "z", slots: {}, agent: null },
    });
    expect(summary).not.toBe(base.event_type);
  });
});

describe("extractOpsFinalAnswer", () => {
  it("优先返回 final.answer payload.answer", () => {
    const answer = extractOpsFinalAnswer([
      {
        run_id: "r1",
        seq: 1,
        ts_ms: 1,
        node_id: null,
        agent_role: "orchestrator",
        event_type: "final.answer",
        payload: { answer: "最终答案" },
      },
    ]);
    expect(answer).toBe("最终答案");
  });
});

describe("OpsChat turn helpers", () => {
  it("findClarifyEvent 从事件列表提取 clarify.asked", () => {
    const events: OpsRunEvent[] = [
      {
        run_id: "r1",
        seq: 1,
        ts_ms: 1,
        node_id: null,
        agent_role: "orchestrator",
        event_type: "clarify.asked",
        payload: { schema_version: "v1", clarify_question: "你想比较哪方面？" },
      },
    ];
    const found = findClarifyEvent(events);
    expect(found?.clarify_question).toBe("你想比较哪方面？");
  });

  it("findCheckpointResumeEvent 提取 checkpoint.resume", () => {
    const events: OpsRunEvent[] = [
      {
        run_id: "r1",
        seq: 1,
        ts_ms: 1,
        node_id: null,
        agent_role: "orchestrator",
        event_type: "checkpoint.resume",
        payload: { from_run_id: "run-prev", step: 2 },
      },
    ];
    const found = findCheckpointResumeEvent(events);
    expect(found?.from_run_id).toBe("run-prev");
    expect(found?.step).toBe(2);
  });

  it("findReactMaxStepsEvent 提取 react.max_steps 步数", () => {
    const events: OpsRunEvent[] = [
      {
        run_id: "r1",
        seq: 1,
        ts_ms: 1,
        node_id: null,
        agent_role: "react",
        event_type: "react.max_steps",
        payload: { max_steps: 8 },
      },
    ];
    expect(findReactMaxStepsEvent(events)).toBe(8);
  });

  it("createOpsChatTurn 构造初始 turn", () => {
    const turn = createOpsChatTurn({
      runId: "r1",
      query: "hello",
      route: "deep",
      status: "queued",
    });
    expect(turn.runId).toBe("r1");
    expect(turn.query).toBe("hello");
    expect(turn.route).toBe("deep");
    expect(turn.finalAnswer).toBe("");
    expect(turn.events).toHaveLength(0);
  });

  it("appendOpsChatTurn 追加并限制最大保留数", () => {
    let turns: OpsChatTurn[] = [];
    for (let i = 0; i < 5; i += 1) {
      turns = appendOpsChatTurn(turns, createOpsChatTurn({ runId: `r${i}`, query: `q${i}`, route: "fast", status: "done" }));
    }
    expect(turns).toHaveLength(5);
    const limited = appendOpsChatTurn(
      turns,
      createOpsChatTurn({ runId: "r-new", query: "new", route: "fast", status: "done" }),
      { maxTurns: 5 },
    );
    expect(limited).toHaveLength(5);
    expect(limited[0].runId).toBe("r1");
    expect(limited[4].runId).toBe("r-new");
  });

  it("updateOpsChatTurn 按 runId 更新", () => {
    const turns: OpsChatTurn[] = [
      createOpsChatTurn({ runId: "r1", query: "q1", route: "fast", status: "done" }),
      createOpsChatTurn({ runId: "r2", query: "q2", route: "deep", status: "running" }),
    ];
    const updated = updateOpsChatTurn(turns, "r2", { status: "done", finalAnswer: "answer" });
    expect(updated[1].status).toBe("done");
    expect(updated[1].finalAnswer).toBe("answer");
    expect(updated[0].status).toBe("done");
  });
});
