import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  fetchOpsSessionGraphPromotePreview,
  fetchOpsSessionPromotePreview,
  postOpsSessionGraphPromote,
  postOpsSessionPromote,
  type ConflictAction,
  type OpsSessionGraphPromotePreview,
  type OpsSessionPromotePreview,
} from "@/lib/ops/session";

describe("session promote conflict UI contract", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockPreview = (overrides?: Partial<OpsSessionPromotePreview>): OpsSessionPromotePreview => ({
    session_id: "sess_test",
    source_task_path: "/src/task.md",
    target_repo: "ai-ink-brain-api-python",
    target_branch: "main",
    target_task_path: "/dst/task.md",
    target_exists: true,
    conflict: true,
    conflict_action: "block",
    diff_summary: {
      source_lines: 10,
      target_lines: 8,
      added: ["new line"],
      removed: ["old line"],
      changed: [{ field: "status", source: "draft", target: "done" }],
    },
    gate_summary: { pending: ["HG-PROMOTE-OVERWRITE"], approved: [] },
    probe_available: true,
    ...overrides,
  });

  it("fetchOpsSessionPromotePreview parses conflict_action and diff_summary", async () => {
    const preview = mockPreview({ conflict_action: "merge" });
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify(preview), { status: 200 }),
    );
    const data = await fetchOpsSessionPromotePreview(
      "sess_test",
      "ai-ink-brain-api-python",
      "main",
    );
    expect(data).not.toBeNull();
    expect(data?.conflict_action).toBe("merge");
    expect(data?.diff_summary?.changed).toHaveLength(1);
    expect(data?.diff_summary?.added).toContain("new line");
  });

  it("postOpsSessionPromote forwards conflict_action=overwrite", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          session_id: "sess_test",
          status: "promoted",
          target_repo: "ai-ink-brain-api-python",
          target_branch: "main",
          target_task_path: "/dst/task.md",
          verify_passed: true,
          conflict_action: "overwrite",
          message: "覆盖成功",
        }),
        { status: 200 },
      ),
    );
    const res = await postOpsSessionPromote("sess_test", {
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      confirm: true,
      conflict_action: "overwrite",
    });
    expect(res.ok).toBe(true);
    expect(res.data.conflict_action).toBe("overwrite");

    const callBody = vi.mocked(fetch).mock.calls[0][1] as { body: string };
    const parsed = JSON.parse(callBody.body);
    expect(parsed.conflict_action).toBe("overwrite");
  });

  it("postOpsSessionPromote forwards conflict_action=merge", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          session_id: "sess_test",
          status: "promoted",
          target_repo: "ai-ink-brain-api-python",
          target_branch: "main",
          target_task_path: "/dst/task.md",
          verify_passed: true,
          conflict_action: "merge",
          merge_draft_path: "/dst/task_merged.md",
          message: "合并版已落盘",
        }),
        { status: 200 },
      ),
    );
    const res = await postOpsSessionPromote("sess_test", {
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      confirm: true,
      conflict_action: "merge" as ConflictAction,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.merge_draft_path).toBe("/dst/task_merged.md");
    }

    const callBody = vi.mocked(fetch).mock.calls[0][1] as { body: string };
    const parsed = JSON.parse(callBody.body);
    expect(parsed.conflict_action).toBe("merge");
  });

  it("postOpsSessionPromote maps 409 PROMOTE_MERGE_BLOCKED to error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ detail: { code: "PROMOTE_MERGE_BLOCKED", message: "HG-PROMOTE-OVERWRITE 未签" } }),
        { status: 409 },
      ),
    );
    const res = await postOpsSessionPromote("sess_test", {
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      confirm: true,
      conflict_action: "merge",
    });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("PROMOTE_MERGE_BLOCKED");
  });
});


describe("session graph promote UI contract", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const mockGraphPreview = (overrides?: Partial<OpsSessionGraphPromotePreview>): OpsSessionGraphPromotePreview => ({
    session_id: "sess_test",
    target_repo: "ai-ink-brain-api-python",
    target_branch: "main",
    source_dir: "docs/harness/sessions/sess_test/deliverables/run_1/graph_delta",
    target_dir: "docs/_tech_graph",
    files: [
      { name: "10_flow_rag.graph.yaml", source_path: "graph_delta/10_flow_rag.graph.yaml", target_path: "docs/_tech_graph/10_flow_rag.graph.yaml", exists: true },
    ],
    diff_summary: [
      {
        path: "10_flow_rag.graph.yaml",
        source_lines: 24,
        target_lines: 20,
        added: ["new node"],
        removed: ["old node"],
        changed: ["field x"],
      },
    ],
    conflict: true,
    conflict_action: "block",
    gate_summary: { pending: ["HG-PROMOTE-GRAPH"], approved: [] },
    empty: false,
    ...overrides,
  });

  it("fetchOpsSessionGraphPromotePreview parses file list and diff", async () => {
    const preview = mockGraphPreview({ conflict_action: "overwrite" as ConflictAction });
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(preview), { status: 200 }));
    const data = await fetchOpsSessionGraphPromotePreview("sess_test", "ai-ink-brain-api-python", "main");
    expect(data).not.toBeNull();
    expect(data?.files).toHaveLength(1);
    expect(data?.files[0].exists).toBe(true);
    expect(data?.diff_summary[0].added).toContain("new node");
    expect(data?.conflict).toBe(true);
  });

  it("postOpsSessionGraphPromote forwards conflict_action and returns copied files", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          session_id: "sess_test",
          status: "graph_promoted",
          target_repo: "ai-ink-brain-api-python",
          target_branch: "main",
          copied_files: ["docs/_tech_graph/10_flow_rag.graph.yaml"],
          conflict_action: "overwrite",
          message: "图谱已复制",
        }),
        { status: 200 },
      ),
    );
    const res = await postOpsSessionGraphPromote("sess_test", {
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      confirm: true,
      conflict_action: "overwrite",
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.data.copied_files).toHaveLength(1);
    }

    const callBody = vi.mocked(fetch).mock.calls[0][1] as { body: string };
    const parsed = JSON.parse(callBody.body);
    expect(parsed.conflict_action).toBe("overwrite");
  });

  it("postOpsSessionGraphPromote maps 409 GRAPH_PROMOTE_GATE_PENDING to error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({ detail: { code: "GRAPH_PROMOTE_GATE_PENDING", message: "HG-PROMOTE-GRAPH 未签" } }),
        { status: 409 },
      ),
    );
    const res = await postOpsSessionGraphPromote("sess_test", {
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      confirm: true,
      conflict_action: "overwrite",
    });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("GRAPH_PROMOTE_GATE_PENDING");
  });
});
