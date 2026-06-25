import { afterEach, describe, expect, it, vi } from "vitest";

import {
  extractOpsCitations,
  extractOpsFinalAnswer,
  formatOpsEventSummary,
  isReviewEventType,
  isRunActive,
  mergeOpsEvents,
  parseAgentToolResultPayload,
  parseReviewPayload,
  partitionThinkingChain,
  fetchOpsChatModels,
  sendOpsChatMessage,
  type OpsRunEvent,
} from "@/lib/ops/chat";

describe("fetchOpsChatModels", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("解析 models 响应", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            provider: "bailian",
            models: [{ id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", test_only: false }],
            default_model: "deepseek-v4-pro",
            auto_fallback: true,
          }),
          { status: 200 },
        ),
      ),
    );

    const data = await fetchOpsChatModels();
    expect(data?.provider).toBe("bailian");
    expect(data?.auto_fallback).toBe(true);
    expect(data?.models).toHaveLength(1);
  });

  it("非 200 返回 null", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 502 })));
    expect(await fetchOpsChatModels()).toBeNull();
  });
});

describe("sendOpsChatMessage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("POST body 含 model 字段", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ run_id: "run-1", route: "fast", status: "done", answer: "ok" }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await sendOpsChatMessage("hello", undefined, "deepseek-v4-pro");
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ops/chat/messages",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ message: "hello", model: "deepseek-v4-pro" }),
      }),
    );
  });

  it("失败时返回结构化 error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "upstream fail" }), { status: 502 })),
    );
    const result = await sendOpsChatMessage("hello");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("upstream fail");
  });
});

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

describe("parseAgentToolResultPayload", () => {
  it("解析完整 v2 payload", () => {
    const payload = {
      issue_number: 545,
      confidence: 0.82,
      reasoning: "缓存失效边界条件",
      suggestion: "补充原子操作",
      citations: [{ number: 545, url: "https://github.com/Cyning12/ai-ink-brain/issues/545" }],
    };
    const parsed = parseAgentToolResultPayload(payload);
    expect(parsed.issue_number).toBe(545);
    expect(parsed.confidence).toBe(0.82);
    expect(parsed.reasoning).toBe("缓存失效边界条件");
    expect(parsed.suggestion).toBe("补充原子操作");
    expect(parsed.citations).toHaveLength(1);
    expect(parsed.citations?.[0].number).toBe(545);
    expect(parsed.citations?.[0].url).toBe("https://github.com/Cyning12/ai-ink-brain/issues/545");
  });

  it("缺失字段返回 undefined", () => {
    const parsed = parseAgentToolResultPayload({});
    expect(parsed.issue_number).toBeUndefined();
    expect(parsed.confidence).toBeUndefined();
    expect(parsed.reasoning).toBeUndefined();
    expect(parsed.suggestion).toBeUndefined();
    expect(parsed.citations).toBeUndefined();
  });

  it("过滤非法 citations", () => {
    const payload = {
      citations: [
        { number: 545, url: "https://github.com/545" },
        { number: "bad", url: 123 },
        null,
      ],
    };
    const parsed = parseAgentToolResultPayload(payload);
    expect(parsed.citations).toHaveLength(1);
    expect(parsed.citations?.[0].number).toBe(545);
  });
});

describe("parseReviewPayload", () => {
  it("解析 review.fail payload", () => {
    const payload = { rule: "V2", message: "confidence 低于阈值", attempt: 0 };
    const parsed = parseReviewPayload(payload);
    expect(parsed.rule).toBe("V2");
    expect(parsed.message).toBe("confidence 低于阈值");
    expect(parsed.attempt).toBe(0);
  });

  it("缺失字段返回 undefined", () => {
    const parsed = parseReviewPayload({});
    expect(parsed.rule).toBeUndefined();
    expect(parsed.message).toBeUndefined();
    expect(parsed.attempt).toBeUndefined();
  });
});

describe("isReviewEventType", () => {
  it("识别 review 事件", () => {
    expect(isReviewEventType("review.pass")).toBe(true);
    expect(isReviewEventType("review.fail")).toBe(true);
    expect(isReviewEventType("review.partial")).toBe(true);
    expect(isReviewEventType("agent.tool.result")).toBe(false);
    expect(isReviewEventType("final.answer")).toBe(false);
  });
});

describe("partitionThinkingChain", () => {
  it("Deep 事件链正确分区", () => {
    const events = [
      makeEvent(1, "run.start"),
      makeEvent(2, "router.decision", { route: "deep" }),
      makeEvent(3, "agent.delegate.start", { agent: "issue_analyst" }),
      makeEvent(4, "agent.tool.result", {
        issue_number: 545,
        confidence: 0.72,
        reasoning: "...",
        suggestion: "...",
      }),
      makeEvent(5, "review.fail", { rule: "V2", message: "...", attempt: 0 }),
      makeEvent(6, "agent.delegate.start", { agent: "issue_analyst", retry: true }),
      makeEvent(7, "agent.tool.result", { confidence: 0.88, reasoning: "..." }),
      makeEvent(8, "review.pass", { rule: "V2", attempt: 1 }),
      makeEvent(9, "final.answer", { answer: "最终答案" }),
      makeEvent(10, "run.end"),
    ];
    const chain = partitionThinkingChain(events);

    expect(chain).toHaveLength(10);

    // run.start / router.decision / run.end -> other
    expect(chain[0].phase).toBe("other");
    expect(chain[1].phase).toBe("other");
    expect(chain[9].phase).toBe("other");

    // delegate + tool.result -> analysis
    expect(chain[2].phase).toBe("analysis");
    expect(chain[3].phase).toBe("analysis");
    expect(chain[3].toolResult?.confidence).toBe(0.72);

    // review.fail -> review
    expect(chain[4].phase).toBe("review");
    expect(chain[4].review?.rule).toBe("V2");

    // retry delegate + tool.result -> analysis
    expect(chain[5].phase).toBe("analysis");
    expect(chain[6].phase).toBe("analysis");

    // review.pass -> review
    expect(chain[7].phase).toBe("review");

    // final.answer -> final
    expect(chain[8].phase).toBe("final");
  });

  it("空事件返回空数组", () => {
    expect(partitionThinkingChain([])).toEqual([]);
  });
});

describe("formatOpsEventSummary", () => {
  it("agent.tool.result 含 issue_number + confidence", () => {
    const event = makeEvent(1, "agent.tool.result", {
      issue_number: 545,
      confidence: 0.82,
    });
    expect(formatOpsEventSummary(event)).toBe("工具返回结果 · #545 · 置信度 0.82");
  });

  it("review.fail 含 rule", () => {
    const event = makeEvent(1, "review.fail", { rule: "V2", message: "..." });
    expect(formatOpsEventSummary(event)).toBe("Review 失败 · V2");
  });

  it("router.decision 含 route", () => {
    const event = makeEvent(1, "router.decision", { route: "deep" });
    expect(formatOpsEventSummary(event)).toBe("路由决策 · deep");
  });
});

describe("extractOpsCitations", () => {
  it("提取所有 citations 并去重", () => {
    const events = [
      makeEvent(1, "agent.tool.result", {
        citations: [{ number: 545, url: "https://a.com/545" }],
      }),
      makeEvent(2, "agent.tool.result", {
        citations: [
          { number: 545, url: "https://a.com/545" },
          { number: 546, url: "https://a.com/546" },
        ],
      }),
      makeEvent(3, "final.answer", {
        citations: [{ number: 545, url: "https://a.com/545" }],
      }),
    ];
    const citations = extractOpsCitations(events);
    expect(citations).toHaveLength(2);
    expect(citations[0].url).toBe("https://a.com/545");
    expect(citations[1].url).toBe("https://a.com/546");
  });

  it("无 citations 返回空数组", () => {
    expect(extractOpsCitations([makeEvent(1, "run.start")])).toEqual([]);
  });
});
