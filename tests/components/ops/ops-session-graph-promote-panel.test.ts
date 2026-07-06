import { describe, it, expect } from "vitest";

import type {
  ConflictAction,
  OpsSessionGraphPromoteDiff,
  OpsSessionGraphPromoteFile,
  OpsSessionGraphPromotePreview,
} from "@/lib/ops/session";

describe("OpsSessionGraphPromotePanel contract", () => {
  it("requires file list and target paths in preview", () => {
    const files: OpsSessionGraphPromoteFile[] = [
      {
        name: "10_flow_rag.graph.yaml",
        source_path: "graph_delta/10_flow_rag.graph.yaml",
        target_path: "docs/_tech_graph/10_flow_rag.graph.yaml",
        exists: true,
      },
    ];
    const preview: OpsSessionGraphPromotePreview = {
      session_id: "sess_test",
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      source_dir: "docs/harness/sessions/sess_test/deliverables/run_1/graph_delta",
      target_dir: "docs/_tech_graph",
      files,
      diff_summary: [],
      conflict: false,
      gate_summary: { pending: ["HG-PROMOTE-GRAPH"], approved: [] },
      empty: false,
    };
    expect(preview.files[0].target_path).toContain("_tech_graph");
    expect(preview.empty).toBe(false);
  });

  it("diff summary carries added/removed/changed lines", () => {
    const diff: OpsSessionGraphPromoteDiff = {
      path: "10_flow_rag.graph.yaml",
      source_lines: 24,
      target_lines: 20,
      added: ["new node"],
      removed: ["old node"],
      changed: ["field x"],
    };
    expect(diff.added).toContain("new node");
    expect(diff.removed).toContain("old node");
    expect(diff.changed).toContain("field x");
  });

  it("empty preview hides destructive promote", () => {
    const preview: OpsSessionGraphPromotePreview = {
      session_id: "sess_test",
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      source_dir: "",
      target_dir: "docs/_tech_graph",
      files: [],
      diff_summary: [],
      conflict: false,
      gate_summary: { pending: [], approved: [] },
      empty: true,
    };
    expect(preview.empty).toBe(true);
    expect(preview.files).toHaveLength(0);
  });

  it("conflict preview requires HG-PROMOTE-GRAPH gate", () => {
    const preview: OpsSessionGraphPromotePreview = {
      session_id: "sess_test",
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      source_dir: "graph_delta",
      target_dir: "docs/_tech_graph",
      files: [{ name: "a.yaml", source_path: "a.yaml", target_path: "docs/_tech_graph/a.yaml", exists: true }],
      diff_summary: [],
      conflict: true,
      conflict_action: "overwrite" as ConflictAction,
      gate_summary: { pending: ["HG-PROMOTE-GRAPH"], approved: [] },
      empty: false,
    };
    expect(preview.conflict).toBe(true);
    expect(preview.gate_summary.pending).toContain("HG-PROMOTE-GRAPH");
  });
});
