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
  page?: number;
  pageSize?: number;
};

export async function getIssues(
  repoId: string,
  filter: IssueFilter = {},
): Promise<{ rows: IssueRow[]; count: number }> {
  const { state, labels, page = 1, pageSize = 25 } = filter;
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
