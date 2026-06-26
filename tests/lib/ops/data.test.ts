import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getLatestScanSnapshot,
  getLatestGraphSnapshot,
  getGraphModuleIssues,
  getGraphModuleIssuesFromBff,
  OpsDataError,
  type ScanSnapshotSummary,
  type GraphSnapshotSummary,
} from "@/lib/ops/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchOpsRaw } from "@/lib/server/forward-ops-request";
import {
  buildQueryString,
  parseFilter,
  scanTagStyle,
} from "@/lib/ops/filter";
import scanFixture from "@/tests/fixtures/ops_scan_snapshot_v1.json";
import graphSnapshotFixture from "@/tests/fixtures/graph_snapshot_sample_v1.json";
import graphModuleOpenFixture from "@/tests/fixtures/graph_module_issues_open_v1.json";
import graphModuleMatrixApiFixture from "@/tests/fixtures/graph_module_matrix_api_v1.json";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/server/forward-ops-request", () => ({
  fetchOpsRaw: vi.fn(),
}));

const mockClient = createSupabaseServerClient as ReturnType<
  typeof vi.fn
>;

const mockFetchOpsRaw = fetchOpsRaw as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockFetchOpsRaw.mockReset();
});

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
  it("returns the latest graph snapshot with node counts", async () => {
    const client = makeSupabaseChain({ data: graphSnapshotFixture, error: null });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const snapshot = await getLatestGraphSnapshot("repo-1");

    expect(snapshot).not.toBeNull();
    expect(snapshot?.source_branch).toBe("cyning/meta");
    expect(snapshot?.manifest_version).toBe("0.1.0");
    expect(snapshot?.schema_version).toBe("graph_v2");
    expect(snapshot?.node_count).toBe(5);
    expect(snapshot?.edge_count).toBe(1);
    expect(snapshot?.graph_count).toBe(1);
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
  it("builds module rows from graph payload and open issues", async () => {
    const snapshotChain = {
      select: vi.fn(() => snapshotChain),
      eq: vi.fn(() => snapshotChain),
      order: vi.fn(() => snapshotChain),
      limit: vi.fn(() => snapshotChain),
      single: vi.fn(() =>
        Promise.resolve({
          data: { payload: graphSnapshotFixture.payload },
          error: null,
        }),
      ),
    };
    const issuesChain = {
      select: vi.fn(() => issuesChain),
      eq: vi.fn(() => issuesChain),
    };
    issuesChain.eq.mockImplementation((column: string, value: string) => {
      if (column === "state" && value === "open") {
        return Promise.resolve({ data: graphModuleOpenFixture, error: null });
      }
      return issuesChain;
    });

    const client = {
      from: vi.fn((table: string) => {
        if (table === "ops_graph_snapshots") return snapshotChain;
        if (table === "ops_issues") return issuesChain;
        throw new Error(`unexpected table ${table}`);
      }),
    };
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const rows = await getGraphModuleIssues("repo-1");

    expect(rows.length).toBeGreaterThan(0);
    const parser = rows.find((row) => row.module_id === "parser");
    expect(parser?.issue_count).toBe(3);
    expect(parser?.p0_count).toBe(1);
    expect(parser?.issue_numbers).toContain(201);
  });

  it("returns empty array when no graph snapshot exists", async () => {
    const client = makeSupabaseChain({
      data: null,
      error: { code: "PGRST116", message: "No rows found" },
    });
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    const rows = await getGraphModuleIssues("repo-1");

    expect(rows).toHaveLength(0);
  });

  it("throws OpsDataError on issues query failure", async () => {
    const snapshotChain = {
      select: vi.fn(() => snapshotChain),
      eq: vi.fn(() => snapshotChain),
      order: vi.fn(() => snapshotChain),
      limit: vi.fn(() => snapshotChain),
      single: vi.fn(() =>
        Promise.resolve({
          data: { payload: graphSnapshotFixture.payload },
          error: null,
        }),
      ),
    };
    const issuesChain = {
      select: vi.fn(() => issuesChain),
      eq: vi.fn(() => issuesChain),
    };
    issuesChain.eq.mockImplementation((column: string, value: string) => {
      if (column === "state" && value === "open") {
        return Promise.resolve({
          data: null,
          error: { code: "PGRST204", message: "relation does not exist" },
        });
      }
      return issuesChain;
    });

    const client = {
      from: vi.fn((table: string) => {
        if (table === "ops_graph_snapshots") return snapshotChain;
        if (table === "ops_issues") return issuesChain;
        throw new Error(`unexpected table ${table}`);
      }),
    };
    mockClient.mockReturnValue(
      client as unknown as ReturnType<typeof createSupabaseServerClient>,
    );

    await expect(getGraphModuleIssues("repo-1")).rejects.toBeInstanceOf(
      OpsDataError,
    );
  });
});

describe("getGraphModuleIssuesFromBff", () => {
  it("maps Python module matrix response to GraphModuleRow", async () => {
    mockFetchOpsRaw.mockResolvedValue(
      new Response(JSON.stringify(graphModuleMatrixApiFixture), { status: 200 }),
    );

    const rows = await getGraphModuleIssuesFromBff();

    expect(mockFetchOpsRaw).toHaveBeenCalledWith(
      "/api/py/ops/graph/module-issues?state=open",
      { method: "GET" },
    );
    expect(rows).toHaveLength(2);
    const parser = rows.find((row) => row.module_id === "parser");
    expect(parser?.module_name).toBe("Parser");
    expect(parser?.issue_count).toBe(3);
    expect(parser?.open_count).toBe(3);
    expect(parser?.p0_count).toBe(1);
    expect(parser?.issue_numbers).toEqual([201, 202, 204]);
  });

  it("throws OpsDataError when Python API returns non-OK", async () => {
    mockFetchOpsRaw.mockResolvedValue(
      new Response("upstream error", { status: 502 }),
    );

    await expect(getGraphModuleIssuesFromBff()).rejects.toBeInstanceOf(OpsDataError);
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
  it("has expected graph structure", () => {
    const row = graphSnapshotFixture as {
      payload: { nodes: unknown[]; edges: unknown[]; graphs: unknown[] };
    };
    expect(row.payload.nodes.length).toBeGreaterThan(0);
    expect(row.payload.edges.length).toBeGreaterThan(0);
    expect(row.payload.graphs.length).toBeGreaterThan(0);
  });
});

describe("graph module open issues fixture", () => {
  it("has module labels for matrix matching", () => {
    const issues = graphModuleOpenFixture as Array<{ labels: string[] }>;
    expect(issues.some((issue) => issue.labels.includes("module:parser"))).toBe(
      true,
    );
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
