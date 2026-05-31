import { describe, expect, it } from "vitest";

import { isValidAgentPlanPreviewPayload } from "@/lib/unified-chat/sse/chainPayloadValidators";

const previewCommon = {
  plan_id: "plan-rag-001",
  tool: "rag_search",
  warnings: ["TTL 120s"],
  plan_execution_token: "tok-rag-abc",
  expires_in_sec: 120,
} as const;

describe("isValidAgentPlanPreviewPayload", () => {
  it("accepts rag_search with rewrite_query and no sql_draft (F2 / FE-1)", () => {
    expect(
      isValidAgentPlanPreviewPayload({
        ...previewCommon,
        rewrite_query: "RRF 融合策略 核心思想",
      }),
    ).toBe(true);
  });

  it("accepts rag_search with optional planned_top_k and preview_headlines", () => {
    expect(
      isValidAgentPlanPreviewPayload({
        ...previewCommon,
        rewrite_query: "指标 macro-F1 定义",
        planned_top_k: 5,
        preview_headlines: ["文档 A", "文档 B"],
      }),
    ).toBe(true);
  });

  it("rejects rag_search missing rewrite_query", () => {
    expect(isValidAgentPlanPreviewPayload({ ...previewCommon })).toBe(false);
  });

  it("accepts text2sql_query with sql_draft (5-2 baseline)", () => {
    expect(
      isValidAgentPlanPreviewPayload({
        plan_id: "plan-sql-001",
        tool: "text2sql_query",
        sql_draft: "SELECT count(*) FROM agent_info",
        warnings: [],
        plan_execution_token: "tok-sql-xyz",
        expires_in_sec: 120,
      }),
    ).toBe(true);
  });

  it("rejects text2sql_query missing sql_draft", () => {
    expect(
      isValidAgentPlanPreviewPayload({
        plan_id: "plan-sql-002",
        tool: "text2sql_query",
        warnings: [],
        plan_execution_token: "tok-sql-xyz",
        expires_in_sec: 120,
      }),
    ).toBe(false);
  });

  it("rejects missing plan_execution_token", () => {
    expect(
      isValidAgentPlanPreviewPayload({
        ...previewCommon,
        rewrite_query: "q",
        plan_execution_token: "",
      }),
    ).toBe(false);
  });
});
