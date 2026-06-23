import { describe, it, expect, vi } from "vitest";
import {
  getLatestScanSnapshot,
  getLatestGraphSnapshot,
  getGraphModuleIssues,
  OpsDataError,
  type ScanSnapshotSummary,
  type GraphSnapshotSummary,
  type GraphModuleRow,
} from "@/lib/ops/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildQueryString,
  parseFilter,
  scanTagStyle,
} from "@/lib/ops/filter";
import scanFixture from "@/tests/fixtures/ops_scan_snapshot_v1.json";
import graphSnapshotFixture from "@/tests/fixtures/graph_snapshot_sample_v1.json";
import graphModuleFixture from "@/tests/fixtures/graph_module_issues_v1.json";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const mockClient = createSupabaseServerClient as ReturnType<
  typeof vi.fn
>;

function makeSupabaseChain(result: {
  data: unknown;
  error: { code: string; message: string } | null;
}) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => chain),
    limit: vi.fn(() => chain),
    overlaps: vi.fn(() => chain),
    range: vi.fn(() => Promise.resolve(result)),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return {
    from: vi.fn(() => chain),
  };
}

function makeSupabaseChainMulti(result: {
  data: unknown;
  error: { code: string; message: string } | null;
}) {
  const chain = {
    select: vi.fn(() => chain),
    eq: vi.fn(() => chain),
    order: vi.fn(() => Promise.resolve(result)),
    limit: vi.fn(() => chain),
    overlaps: vi.fn(() => chain),
    range: vi.fn(() => Promise.resolve(result)),
    single: vi.fn(() => Promise.resolve(result)),
  };
  return {
    from: vi.fn(() => chain),
  };
}

describe("getLatestScanSnapshot", () => {
  it("returns the latest snapshot with tier counts", async () => {
    const client = makeSupabaseChain({ data: scanFixture, error: null });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const snapshot = await getLatestScanSnapshot("repo-1");

    expect(snapshot).not.toBeNull();
    expect(snapshot?.scan_version).toBe("v1.5.1");
    expect(snapshot?.total_open).toBe(7);
    expect(snapshot?.p0_items).toHaveLength(1);
    expect(snapshot?.p1_items).toHaveLength(2);
    expect(snapshot?.p2_items).toHaveLength(4);
    expect(snapshot?.raw_markdown_url).toContain("raw.githubusercontent.com");
  });

  it("returns null when no snapshot exists (PGRST116)", async () => {
    const client = makeSupabaseChain({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const snapshot = await getLatestScanSnapshot("repo-1");

    expect(snapshot).toBeNull();
  });

  it("throws OpsDataError on database failures", async () => {
    const client = makeSupabaseChain({
      data: null,
      error: { code: "PGRST204", message: "relation does not exist" },
    });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    await expect(getLatestScanSnapshot("repo-1")).rejects.toBeInstanceOf(
      OpsDataError,
    );
  });
});

describe("getLatestGraphSnapshot", () => {
  it("returns the latest graph snapshot with tier counts", async () => {
    const client = makeSupabaseChain({ data: graphSnapshotFixture, error: null });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const snapshot = await getLatestGraphSnapshot("repo-1");

    expect(snapshot).not.toBeNull();
    expect(snapshot?.scan_version).toBe("v2.0.0");
    expect(snapshot?.total_open).toBe(12);
    expect(snapshot?.p0_items).toHaveLength(1);
    expect(snapshot?.p1_items).toHaveLength(2);
    expect(snapshot?.p2_items).toHaveLength(9);
  });

  it("returns null when no graph snapshot exists (PGRST116)", async () => {
    const client = makeSupabaseChain({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const snapshot = await getLatestGraphSnapshot("repo-1");

    expect(snapshot).toBeNull();
  });

  it("throws OpsDataError on graph snapshot database failures", async () => {
    const client = makeSupabaseChain({
      data: null,
      error: { code: "PGRST204", message: "relation does not exist" },
    });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    await expect(getLatestGraphSnapshot("repo-1")).rejects.toBeInstanceOf(
      OpsDataError,
    );
  });
});

describe("getGraphModuleIssues", () => {
  it("returns module rows ordered by issue_count desc", async () => {
    const client = makeSupabaseChainMulti({ data: graphModuleFixture, error: null });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const rows = await getGraphModuleIssues("repo-1");

    expect(rows).toHaveLength(5);
    const typed = rows as GraphModuleRow[];
    expect(typed[0].module_id).toBe("parser");
    expect(typed[0].issue_count).toBe(3);
    expect(typed[0].p0_count).toBe(1);
    expect(typed[0].issue_numbers).toContain(201);
  });

  it("returns empty array when no modules", async () => {
    const client = makeSupabaseChainMulti({ data: [], error: null });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const rows = await getGraphModuleIssues("repo-1");

    expect(rows).toHaveLength(0);
  });

  it("throws OpsDataError on database failures", async () => {
    const chain = {
      select: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      order: vi.fn(() =>
        Promise.resolve({
          data: null,
          error: { code: "PGRST204", message: "relation does not exist" },
        }),
      ),
    };
    const client = {
      from: vi.fn(() => chain),
    };
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    await expect(getGraphModuleIssues("repo-1")).rejects.toBeInstanceOf(
      OpsDataError,
    );
  });
});

describe("scan snapshot fixture", () => {
  it("has expected tier distribution", () => {
    const summary = scanFixture as unknown as ScanSnapshotSummary;
    expect(summary.p0_items.length + summary.p1_items.length + summary.p2_items.length).toBe(
      summary.total_open ?? 0,
    );
  });
});

describe("graph snapshot fixture", () => {
  it("has expected tier distribution", () => {
    const summary = graphSnapshotFixture as unknown as GraphSnapshotSummary;
    expect(summary.p0_items.length + summary.p1_items.length + summary.p2_items.length).toBe(
      summary.total_open ?? 0,
    );
  });
});

describe("graph module fixture", () => {
  it("has expected module structure", () => {
    const modules = graphModuleFixture as unknown as GraphModuleRow[];
    expect(modules.length).toBeGreaterThan(0);
    const first = modules[0];
    expect(first.module_id).toBeDefined();
    expect(first.module_name).toBeDefined();
    expect(first.issue_count).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(first.issue_numbers)).toBe(true);
  });

  it("has non-negative tier counts", () => {
    const modules = graphModuleFixture as unknown as GraphModuleRow[];
    for (const mod of modules) {
      expect(mod.p0_count).toBeGreaterThanOrEqual(0);
      expect(mod.p1_count).toBeGreaterThanOrEqual(0);
      expect(mod.p2_count).toBeGreaterThanOrEqual(0);
      expect(mod.p0_count + mod.p1_count + mod.p2_count).toBeLessThanOrEqual(mod.issue_count);
    }
  });
});

describe("issue filter query helpers", () => {
  it("parses scan_tag from search params", () => {
    const filter = parseFilter({ scan_tag: "C3-P2", state: "open" });
    expect(filter.scanTag).toBe("C3-P2");
    expect(filter.state).toBe("open");
  });

  it("builds a query string with scan tag, labels and pagination", () => {
    const qs = buildQueryString({
      state: "open",
      labels: ["bug"],
      scanTag: "C3-P2",
      page: 2,
    });
    const params = new URLSearchParams(qs.slice(1));
    expect(params.get("state")).toBe("open");
    expect(params.get("labels")).toBe("bug");
    expect(params.get("scan_tag")).toBe("C3-P2");
    expect(params.get("page")).toBe("2");
  });

  it("omits scan_tag from query string when deselected", () => {
    const qs = buildQueryString({
      state: "open",
      scanTag: undefined,
    });
    expect(qs).not.toContain("scan_tag");
  });
});

describe("scanTagStyle", () => {
  it("matches prefixed scan tags like C3-P2", () => {
    expect(scanTagStyle("C3-P2")).toContain("red-100");
    expect(scanTagStyle("C2-A1")).toContain("amber-100");
    expect(scanTagStyle("P2")).toContain("yellow-100");
  });

  it("falls back to default style for unknown tags", () => {
    expect(scanTagStyle("UNKNOWN")).toContain("color-wash");
  });
});
