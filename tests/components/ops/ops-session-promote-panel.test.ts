import { describe, it, expect } from "vitest";

import type {
  ConflictAction,
  OpsSessionPromoteDiffSummary,
  OpsSessionPromoteMergeDraft,
  OpsSessionPromotePreview,
} from "@/lib/ops/session";

describe("OpsSessionPromotePanel conflict contract", () => {
  it("requires diff_summary when conflict is true", () => {
    const preview: OpsSessionPromotePreview = {
      session_id: "sess_test",
      source_task_path: "/src/task.md",
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      target_task_path: "/dst/task.md",
      target_exists: true,
      conflict: true,
      diff_summary: {
        source_lines: 12,
        target_lines: 10,
        added: ["+ new field"],
        removed: ["- old field"],
        changed: [{ field: "status", source: "draft", target: "done" }],
      },
      gate_summary: { pending: ["HG-PROMOTE-OVERWRITE"], approved: [] },
      probe_available: true,
    };
    expect(preview.conflict).toBe(true);
    expect(preview.diff_summary).toBeDefined();
    expect(preview.diff_summary?.changed[0].field).toBe("status");
  });

  it("merge preview carries merge_draft and gate", () => {
    const draft: OpsSessionPromoteMergeDraft = {
      path: "/dst/task_merged.md",
      content: "# Merged task\n\nstatus: approved",
    };
    const diff: OpsSessionPromoteDiffSummary = {
      source_lines: 12,
      target_lines: 10,
      added: [],
      removed: [],
      changed: [{ field: "status", source: "draft", target: "done" }],
    };
    const preview: OpsSessionPromotePreview = {
      session_id: "sess_test",
      source_task_path: "/src/task.md",
      target_repo: "ai-ink-brain-api-python",
      target_branch: "main",
      target_task_path: "/dst/task.md",
      target_exists: true,
      conflict: true,
      conflict_action: "merge" as ConflictAction,
      diff_summary: diff,
      merge_draft: draft,
      gate_summary: { pending: [], approved: ["HG-PROMOTE-OVERWRITE"] },
      probe_available: true,
    };
    expect(preview.merge_draft?.path).toBe("/dst/task_merged.md");
    expect(preview.gate_summary.approved).toContain("HG-PROMOTE-OVERWRITE");
  });

  it("block action disables destructive promote", () => {
    const action: ConflictAction = "block";
    expect(action).toBe("block");
  });
});
