import { createSupabaseServerClient } from "@/lib/supabase/server";

const OWNER = "MoonshotAI";
const NAME = "kimi-code";
const OVERVIEW_PERIOD_DAYS = 30;

export type OpsRepo = {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  default_branch: string | null;
};

export type SyncRun = {
  id: string;
  repo_id: string;
  started_at: string;
  finished_at: string | null;
  status: "pending" | "running" | "success" | "failed" | "partial";
  cursor: string | null;
  records_issue: number;
  records_pr: number;
  error_message: string | null;
  trigger: "cron" | "manual" | "initial";
};

export type IssueRow = {
  id: string;
  repo_id: string;
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  author: string | null;
  html_url: string | null;
  scan_tags: string[];
};

export type PullRequestRow = {
  id: string;
  repo_id: string;
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  draft: boolean;
  labels: string[];
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  author: string | null;
  html_url: string | null;
  checks_conclusion: string | null;
  review_decision: string | null;
  first_review_at: string | null;
};

export type TrendPoint = {
  date: string;
  closedIssues: number;
  mergedPrs: number;
};

export type OverviewMetrics = {
  cycleTime: { medianDays: number | null; sampleSize: number };
  reviewTime: { medianDays: number | null; sampleSize: number };
  issueThroughput: { count: number; periodDays: number };
  asOf: string | null;
  syncStatus: SyncRun["status"] | "none";
  syncRun: SyncRun | null;
  trend: TrendPoint[];
};

export type GraphSnapshotSummary = {
  id: string;
  source_branch: string;
  source_commit: string | null;
  manifest_version: string | null;
  schema_version: string | null;
  freeze_id: string | null;
  node_count: number;
  edge_count: number;
  graph_count: number;
  created_at: string;
};

export type GraphModuleRow = {
  module_id: string;
  module_name: string;
  issue_count: number;
  open_count: number;
  p0_count: number;
  p1_count: number;
  p2_count: number;
  issue_numbers: number[];
};

export type ScanSnapshotSummary = {
  scan_version: string;
  total_open: number | null;
  p0_items: unknown[];
  p1_items: unknown[];
  p2_items: unknown[];
  deferred_items: unknown[];
  parsed_summary: Record<string, unknown> | null;
  raw_markdown_url: string | null;
  created_at: string;
};

export class OpsDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpsDataError";
  }
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function toDateBucket(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildTrendDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = OVERVIEW_PERIOD_DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

export async function getKimiCodeRepo(): Promise<OpsRepo | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ops_repos")
    .select("id, owner, name, full_name, default_branch")
    .eq("owner", OWNER)
    .eq("name", NAME)
    .single();

  if (error) {
    throw new OpsDataError(`查询 ops_repos 失败：${error.message}`);
  }
  return data as OpsRepo | null;
}

export async function getLatestSyncRun(
  repoId: string,
): Promise<SyncRun | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ops_sync_runs")
    .select(
      "id, repo_id, started_at, finished_at, status, cursor, records_issue, records_pr, error_message, trigger",
    )
    .eq("repo_id", repoId)
    .order("started_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new OpsDataError(`查询 ops_sync_runs 失败：${error.message}`);
  }
  return (data as SyncRun | null) ?? null;
}

export async function getLatestScanSnapshot(
  repoId: string,
): Promise<ScanSnapshotSummary | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ops_scan_snapshots")
    .select(
      "scan_version, total_open, p0_items, p1_items, p2_items, deferred_items, parsed_summary, raw_markdown_url, created_at",
    )
    .eq("repo_id", repoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new OpsDataError(`查询 scan snapshot 失败：${error.message}`);
  }
  return (data as ScanSnapshotSummary | null) ?? null;
}

export async function getLatestGraphSnapshot(
  repoId: string,
): Promise<GraphSnapshotSummary | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ops_graph_snapshots")
    .select(
      "id, source_branch, source_commit, manifest_version, payload, created_at",
    )
    .eq("repo_id", repoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new OpsDataError(`查询 graph snapshot 失败：${error.message}`);
  }
  if (!data || typeof data !== "object") {
    return null;
  }

  const row = data as {
    id: string;
    source_branch: string;
    source_commit: string | null;
    manifest_version: string | null;
    payload: Record<string, unknown> | null;
    created_at: string;
  };
  const payload = row.payload ?? {};
  const nodes = Array.isArray(payload.nodes) ? payload.nodes : [];
  const edges = Array.isArray(payload.edges) ? payload.edges : [];
  const graphs = Array.isArray(payload.graphs) ? payload.graphs : [];

  return {
    id: row.id,
    source_branch: row.source_branch,
    source_commit: row.source_commit,
    manifest_version: row.manifest_version,
    schema_version:
      typeof payload.schema_version === "string" ? payload.schema_version : null,
    freeze_id: typeof payload.freeze_id === "string" ? payload.freeze_id : null,
    node_count: nodes.length,
    edge_count: edges.length,
    graph_count: graphs.length,
    created_at: row.created_at,
  };
}

function tierCountsFromScanTags(scanTags: string[]): {
  p0: number;
  p1: number;
  p2: number;
} {
  let p0 = 0;
  let p1 = 0;
  let p2 = 0;
  for (const tag of scanTags) {
    if (/P0/i.test(tag)) p0 += 1;
    else if (/P1/i.test(tag)) p1 += 1;
    else if (/P2/i.test(tag)) p2 += 1;
  }
  return { p0, p1, p2 };
}

export async function getGraphModuleIssues(
  repoId: string,
): Promise<GraphModuleRow[]> {
  const supabase = createSupabaseServerClient();
  const { data: snapshotRow, error: snapshotError } = await supabase
    .from("ops_graph_snapshots")
    .select("payload")
    .eq("repo_id", repoId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (snapshotError && snapshotError.code !== "PGRST116") {
    throw new OpsDataError(`查询 graph snapshot 失败：${snapshotError.message}`);
  }
  if (!snapshotRow || typeof snapshotRow !== "object") {
    return [];
  }

  const payload = (snapshotRow as { payload?: unknown }).payload;
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  const nodes = Array.isArray((payload as Record<string, unknown>).nodes)
    ? ((payload as Record<string, unknown>).nodes as unknown[])
    : [];
  if (nodes.length === 0) {
    return [];
  }

  const { data: issues, error: issuesError } = await supabase
    .from("ops_issues")
    .select("number, state, labels, scan_tags")
    .eq("repo_id", repoId)
    .eq("state", "open");

  if (issuesError) {
    throw new OpsDataError(`查询 graph module issues 失败：${issuesError.message}`);
  }

  const openIssues = (issues ?? []) as Array<{
    number: number;
    state: string;
    labels: string[];
    scan_tags: string[];
  }>;

  const rows: GraphModuleRow[] = [];
  for (const rawNode of nodes) {
    if (!rawNode || typeof rawNode !== "object" || Array.isArray(rawNode)) {
      continue;
    }
    const node = rawNode as { id?: string; label?: string };
    const moduleId = node.id?.trim();
    if (!moduleId) continue;

    const moduleLabel = `module:${moduleId}`;
    const matched = openIssues.filter(
      (issue) =>
        Array.isArray(issue.labels) && issue.labels.includes(moduleLabel),
    );
    const tier = tierCountsFromScanTags(
      matched.flatMap((issue) =>
        Array.isArray(issue.scan_tags) ? issue.scan_tags : [],
      ),
    );

    rows.push({
      module_id: moduleId,
      module_name: node.label?.trim() || moduleId,
      issue_count: matched.length,
      open_count: matched.length,
      p0_count: tier.p0,
      p1_count: tier.p1,
      p2_count: tier.p2,
      issue_numbers: matched.map((issue) => issue.number).sort((a, b) => a - b),
    });
  }

  return rows.sort((a, b) => b.issue_count - a.issue_count);
}

export async function getOverviewMetrics(
  repoId: string,
): Promise<OverviewMetrics> {
  const since = daysAgoIso(OVERVIEW_PERIOD_DAYS);
  const supabase = createSupabaseServerClient();

  const [prResult, issueResult, syncRun] = await Promise.all([
    supabase
      .from("ops_pull_requests")
      .select(
        "created_at, merged_at, first_review_at",
      )
      .eq("repo_id", repoId)
      .or(`merged_at.gte.${since},created_at.gte.${since}`),
    supabase
      .from("ops_issues")
      .select("closed_at")
      .eq("repo_id", repoId)
      .or(`closed_at.gte.${since},updated_at.gte.${since}`),
    getLatestSyncRun(repoId),
  ]);

  if (prResult.error) {
    throw new OpsDataError(`查询 PR 失败：${prResult.error.message}`);
  }
  if (issueResult.error) {
    throw new OpsDataError(`查询 Issue 失败：${issueResult.error.message}`);
  }

  const prs = (prResult.data ?? []) as Pick<
    PullRequestRow,
    "created_at" | "merged_at" | "first_review_at"
  >[];
  const issues = (issueResult.data ?? []) as Pick<IssueRow, "closed_at">[];

  const cycleTimes: number[] = [];
  const reviewTimes: number[] = [];
  const mergedPerDay = new Map<string, number>();
  const closedIssuesPerDay = new Map<string, number>();

  for (const pr of prs) {
    if (pr.merged_at) {
      const ms =
        new Date(pr.merged_at).getTime() - new Date(pr.created_at).getTime();
      if (ms >= 0) cycleTimes.push(ms);
      const bucket = toDateBucket(pr.merged_at);
      mergedPerDay.set(bucket, (mergedPerDay.get(bucket) ?? 0) + 1);
    }
    if (pr.first_review_at) {
      const ms =
        new Date(pr.first_review_at).getTime() -
        new Date(pr.created_at).getTime();
      if (ms >= 0) reviewTimes.push(ms);
    }
  }

  for (const issue of issues) {
    if (issue.closed_at) {
      const bucket = toDateBucket(issue.closed_at);
      closedIssuesPerDay.set(bucket, (closedIssuesPerDay.get(bucket) ?? 0) + 1);
    }
  }

  const trendDays = buildTrendDays();
  const trend: TrendPoint[] = trendDays.map((date) => ({
    date,
    closedIssues: closedIssuesPerDay.get(date) ?? 0,
    mergedPrs: mergedPerDay.get(date) ?? 0,
  }));

  const closedInWindow = issues.filter((i) => i.closed_at).length;

  return {
    cycleTime: {
      medianDays: median(cycleTimes)
        ? median(cycleTimes)! / (1000 * 60 * 60 * 24)
        : null,
      sampleSize: cycleTimes.length,
    },
    reviewTime: {
      medianDays: median(reviewTimes)
        ? median(reviewTimes)! / (1000 * 60 * 60 * 24)
        : null,
      sampleSize: reviewTimes.length,
    },
    issueThroughput: {
      count: closedInWindow,
      periodDays: OVERVIEW_PERIOD_DAYS,
    },
    asOf: syncRun?.finished_at ?? syncRun?.started_at ?? null,
    syncStatus: syncRun?.status ?? "none",
    syncRun,
    trend,
  };
}

export type IssueFilter = {
  state?: "open" | "closed";
  labels?: string[];
  scanTag?: string;
  page?: number;
  pageSize?: number;
};

export async function getIssues(
  repoId: string,
  filter: IssueFilter = {},
): Promise<{ rows: IssueRow[]; count: number }> {
  const { state, labels, scanTag, page = 1, pageSize = 25 } = filter;
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("ops_issues")
    .select(
      "id, repo_id, number, title, state, labels, created_at, updated_at, closed_at, author, html_url, scan_tags",
      { count: "exact" },
    )
    .eq("repo_id", repoId)
    .order("updated_at", { ascending: false });

  if (state) {
    query = query.eq("state", state);
  }
  if (labels && labels.length > 0) {
    query = query.overlaps("labels", labels);
  }
  if (scanTag) {
    query = query.overlaps("scan_tags", [scanTag]);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new OpsDataError(`查询 Issue 失败：${error.message}`);
  }
  return { rows: (data ?? []) as IssueRow[], count: count ?? 0 };
}

export type PullFilter = {
  state?: "open" | "closed" | "merged";
  checksConclusion?: string;
  reviewDecision?: string;
  page?: number;
  pageSize?: number;
};

export async function getPullRequests(
  repoId: string,
  filter: PullFilter = {},
): Promise<{ rows: PullRequestRow[]; count: number }> {
  const {
    state,
    checksConclusion,
    reviewDecision,
    page = 1,
    pageSize = 25,
  } = filter;
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("ops_pull_requests")
    .select(
      "id, repo_id, number, title, state, draft, labels, created_at, updated_at, closed_at, merged_at, author, html_url, checks_conclusion, review_decision, first_review_at",
      { count: "exact" },
    )
    .eq("repo_id", repoId)
    .order("updated_at", { ascending: false });

  if (state) {
    query = query.eq("state", state);
  }
  if (checksConclusion) {
    query = query.eq("checks_conclusion", checksConclusion);
  }
  if (reviewDecision) {
    query = query.eq("review_decision", reviewDecision);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new OpsDataError(`查询 Pull Request 失败：${error.message}`);
  }
  return { rows: (data ?? []) as PullRequestRow[], count: count ?? 0 };
}
