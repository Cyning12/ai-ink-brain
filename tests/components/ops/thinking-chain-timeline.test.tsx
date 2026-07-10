import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { ThinkingChainTimeline } from "@/components/ops/ThinkingChainTimeline";
import type { OpsRunEvent } from "@/lib/ops/chat";

describe("ThinkingChainTimeline · schema v1 / P1 事件", () => {
  it("渲染 handoff 事件卡片", () => {
    const events: OpsRunEvent[] = [
      {
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
          slots: { issue_number: 545 },
          agent: "issue_analyst",
        },
      },
    ];
    const html = renderToStaticMarkup(
      <ThinkingChainTimeline events={events} showCopyButtons={false} />,
    );
    expect(html).toContain("router → deep");
    expect(html).toContain("issue_contribution");
    expect(html).toContain("545");
  });

  it("渲染 review v1 事件卡片", () => {
    const events: OpsRunEvent[] = [
      {
        run_id: "r1",
        seq: 1,
        ts_ms: 1,
        node_id: null,
        agent_role: "review",
        event_type: "review",
        payload: { schema_version: "v1", verdict: "pass", rule: "V1_EXISTS", attempt: 1 },
      },
    ];
    const html = renderToStaticMarkup(
      <ThinkingChainTimeline events={events} showCopyButtons={false} />,
    );
    expect(html).toContain("Review");
    expect(html).toContain("pass");
    expect(html).toContain("V1_EXISTS");
  });

  it("渲染 clarify.asked 卡片", () => {
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
    const html = renderToStaticMarkup(
      <ThinkingChainTimeline events={events} showCopyButtons={false} />,
    );
    expect(html).toContain("澄清问题");
    expect(html).toContain("你想比较哪方面？");
  });

  it("渲染 checkpoint.resume 卡片", () => {
    const events: OpsRunEvent[] = [
      {
        run_id: "r1",
        seq: 1,
        ts_ms: 1,
        node_id: null,
        agent_role: "orchestrator",
        event_type: "checkpoint.resume",
        payload: { from_run_id: "run-prev", step: 3 },
      },
    ];
    const html = renderToStaticMarkup(
      <ThinkingChainTimeline events={events} showCopyButtons={false} />,
    );
    expect(html).toContain("Checkpoint 续跑");
    expect(html).toContain("run-prev");
    expect(html).toContain("3");
  });

  it("渲染 artifact.write_failed 错误提示", () => {
    const events: OpsRunEvent[] = [
      {
        run_id: "r1",
        seq: 1,
        ts_ms: 1,
        node_id: null,
        agent_role: "orchestrator",
        event_type: "artifact.write_failed",
        payload: { kind: "react_summary", schema_version: "v1" },
      },
    ];
    const html = renderToStaticMarkup(
      <ThinkingChainTimeline events={events} showCopyButtons={false} />,
    );
    expect(html).toContain("Artifact 写入失败");
    expect(html).toContain("react_summary");
  });
});
