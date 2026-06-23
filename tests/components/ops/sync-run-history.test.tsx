import { describe, it, expect } from "vitest";
import type { SyncRunListItem } from "@/lib/ops/data";
import syncRunsFixture from "@/tests/fixtures/sync_runs_v1.json";

describe("sync_runs_v1 fixture", () => {
  it("has valid SyncRunListItem shape", () => {
    const runs = syncRunsFixture as unknown as SyncRunListItem[];
    expect(runs.length).toBeGreaterThan(0);
    for (const run of runs) {
      expect(typeof run.id).toBe("string");
      expect(typeof run.started_at).toBe("string");
      expect(["pending", "running", "success", "failed", "partial"]).toContain(
        run.status,
      );
      expect(["cron", "manual", "initial"]).toContain(run.trigger);
      expect(typeof run.records_issue).toBe("number");
      expect(typeof run.records_pr).toBe("number");
      expect(typeof run.has_graph_snapshot).toBe("boolean");
      expect(typeof run.has_scan_snapshot).toBe("boolean");
    }
  });

  it("includes at least one manual, cron, and initial trigger", () => {
    const runs = syncRunsFixture as unknown as SyncRunListItem[];
    const triggers = new Set(runs.map((r) => r.trigger));
    expect(triggers.has("manual")).toBe(true);
    expect(triggers.has("cron")).toBe(true);
    expect(triggers.has("initial")).toBe(true);
  });

  it("includes running, success, partial, and failed statuses", () => {
    const runs = syncRunsFixture as unknown as SyncRunListItem[];
    const statuses = new Set(runs.map((r) => r.status));
    expect(statuses.has("running")).toBe(true);
    expect(statuses.has("success")).toBe(true);
    expect(statuses.has("partial")).toBe(true);
    expect(statuses.has("failed")).toBe(true);
  });

  it("has a running run with null finished_at", () => {
    const runs = syncRunsFixture as unknown as SyncRunListItem[];
    const running = runs.find((r) => r.status === "running");
    expect(running).toBeDefined();
    expect(running!.finished_at).toBeNull();
  });

  it("has a failed run with error_message", () => {
    const runs = syncRunsFixture as unknown as SyncRunListItem[];
    const failed = runs.find((r) => r.status === "failed");
    expect(failed).toBeDefined();
    expect(failed!.error_message).not.toBeNull();
    expect(failed!.error_message!.length).toBeGreaterThan(0);
  });
});
