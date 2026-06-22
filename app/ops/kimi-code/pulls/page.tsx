import Link from "next/link";

import {
  getKimiCodeRepo,
  getPullRequests,
  getLatestSyncRun,
  OpsDataError,
  type PullRequestRow,
  type PullFilter,
} from "@/lib/ops/data";
import { formatDate } from "@/lib/ops/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const STATE_OPTIONS: { value: PullFilter["state"]; label: string }[] = [
  { value: undefined, label: "全部" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "merged", label: "Merged" },
];

const CHECKS_OPTIONS: { value: string | undefined; label: string }[] = [
  { value: undefined, label: "全部 CI" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
  { value: "pending", label: "Pending" },
  { value: "skipped", label: "Skipped" },
];

function stateBadge(state: PullRequestRow["state"]) {
  const map: Record<string, { label: string; classes: string }> = {
    open: { label: "Open", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    closed: { label: "Closed", classes: "bg-slate-50 text-slate-600 border-slate-200" },
    merged: { label: "Merged", classes: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  };
  const meta = map[state] ?? { label: state, classes: "bg-slate-50 text-slate-600 border-slate-200" };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${meta.classes}`}>
      {meta.label}
    </span>
  );
}

function checksBadge(conclusion: string | null) {
  if (!conclusion) return <span className="text-xs text-[color:var(--color-muted-foreground)]">—</span>;
  const map: Record<string, { label: string; classes: string }> = {
    success: { label: "✓", classes: "text-emerald-600" },
    failure: { label: "✗", classes: "text-red-600" },
    pending: { label: "○", classes: "text-amber-500" },
    skipped: { label: "−", classes: "text-slate-400" },
  };
  const meta = map[conclusion] ?? { label: conclusion, classes: "text-slate-500" };
  return <span className={`text-xs font-medium ${meta.classes}`} title={conclusion}>{meta.label}</span>;
}

function reviewBadge(decision: string | null) {
  if (!decision) return <span className="text-xs text-[color:var(--color-muted-foreground)]">—</span>;
  const map: Record<string, { label: string; classes: string }> = {
    APPROVED: { label: "Approved", classes: "text-emerald-600" },
    CHANGES_REQUESTED: { label: "Changes", classes: "text-amber-600" },
    REVIEW_REQUIRED: { label: "Required", classes: "text-slate-500" },
  };
  const meta = map[decision] ?? { label: decision, classes: "text-slate-500" };
  return <span className={`text-xs font-medium ${meta.classes}`}>{meta.label}</span>;
}

type PageData =
  | { kind: "loaded"; rows: PullRequestRow[]; count: number; syncRun: Awaited<ReturnType<typeof getLatestSyncRun>> }
  | { kind: "no-repo" }
  | { kind: "error"; message: string };

async function loadPageData(searchParams: {
  state?: string;
  checks?: string;
  page?: string;
}): Promise<PageData> {
  try {
    const repo = await getKimiCodeRepo();
    if (!repo) {
      return { kind: "no-repo" };
    }

    const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
    const state =
      searchParams.state === "open" || searchParams.state === "closed" || searchParams.state === "merged"
        ? searchParams.state
        : undefined;
    const checksConclusion = searchParams.checks || undefined;

    const [prResult, syncRun] = await Promise.all([
      getPullRequests(repo.id, { state, checksConclusion, page, pageSize: PAGE_SIZE }),
      getLatestSyncRun(repo.id),
    ]);

    return { kind: "loaded", rows: prResult.rows, count: prResult.count, syncRun };
  } catch (err) {
    const message =
      err instanceof OpsDataError
        ? err.message
        : "加载 Pull Request 数据失败，请检查环境变量与 Supabase 连接";
    return { kind: "error", message };
  }
}

export default async function OpsKimiCodePullsPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string; checks?: string; page?: string }>;
}) {
  const params = await searchParams;
  const data = await loadPageData(params);

  const currentState = params.state;
  const currentChecks = params.checks;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const totalPages = data.kind === "loaded" ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  function buildLink(pageNum: number, overrides: { state?: string; checks?: string } = {}) {
    const sp = new URLSearchParams();
    const s = overrides.state !== undefined ? overrides.state : currentState;
    const c = overrides.checks !== undefined ? overrides.checks : currentChecks;
    if (s) sp.set("state", s);
    if (c) sp.set("checks", c);
    if (pageNum > 1) sp.set("page", String(pageNum));
    const qs = sp.toString();
    return `/ops/kimi-code/pulls${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Pull Requests
        </h1>
        {data.kind === "loaded" && data.syncRun && (
          <span className="text-xs text-[color:var(--color-muted-foreground)]">
            共 {data.count} 条 · 同步 {formatDate(data.syncRun.finished_at ?? data.syncRun.started_at)}
          </span>
        )}
      </div>

      {data.kind === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="font-medium">加载失败</p>
          <p className="mt-1 text-sm">{data.message}</p>
        </div>
      )}

      {data.kind === "no-repo" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <p className="font-medium">尚未找到监控仓库</p>
          <p className="mt-1 text-sm">
            数据库中不存在 MoonshotAI/kimi-code 的仓库记录，请确认 GHA sync 已首跑成功。
          </p>
        </div>
      )}

      {data.kind === "loaded" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[color:var(--color-muted-foreground)]">State</span>
              <div className="flex gap-1">
                {STATE_OPTIONS.map((opt) => {
                  const active = currentState === opt.value || (!currentState && !opt.value);
                  return (
                    <Link
                      key={opt.label}
                      href={buildLink(1, { state: opt.value ?? "" })}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-[color:var(--color-foreground)] text-[color:var(--color-background)]"
                          : "border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[color:var(--color-muted-foreground)]">CI</span>
              <div className="flex gap-1">
                {CHECKS_OPTIONS.map((opt) => {
                  const active = currentChecks === opt.value || (!currentChecks && !opt.value);
                  return (
                    <Link
                      key={opt.label}
                      href={buildLink(1, { checks: opt.value ?? "" })}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "bg-[color:var(--color-foreground)] text-[color:var(--color-background)]"
                          : "border border-[color:var(--color-border)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
                      }`}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          {data.rows.length === 0 ? (
            <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-10 text-center">
              <p className="text-sm text-[color:var(--color-muted-foreground)]">暂无 Pull Request 数据</p>
              <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
                请确认 GHA sync 已运行且 ops_pull_requests 表有数据。
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-wash)]/40">
                    <th className="px-4 py-2.5 text-left font-medium text-[color:var(--color-muted-foreground)]">#</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[color:var(--color-muted-foreground)]">Title</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[color:var(--color-muted-foreground)]">State</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[color:var(--color-muted-foreground)]">CI</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[color:var(--color-muted-foreground)]">Review</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[color:var(--color-muted-foreground)]">Author</th>
                    <th className="px-4 py-2.5 text-left font-medium text-[color:var(--color-muted-foreground)]">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((pr) => (
                    <tr
                      key={pr.id}
                      className="border-b border-[color:var(--color-border)] transition-colors hover:bg-[color:var(--color-wash)]/30"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {pr.html_url ? (
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] hover:underline"
                          >
                            #{pr.number}
                          </a>
                        ) : (
                          <span className="text-[color:var(--color-muted-foreground)]">#{pr.number}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {pr.html_url ? (
                          <a
                            href={pr.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[color:var(--color-foreground)] hover:underline"
                          >
                            {pr.title}
                          </a>
                        ) : (
                          <span className="font-medium text-[color:var(--color-foreground)]">{pr.title}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{stateBadge(pr.state)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{checksBadge(pr.checks_conclusion)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{reviewBadge(pr.review_decision)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-[color:var(--color-muted-foreground)]">
                        {pr.author ?? "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-[color:var(--color-muted-foreground)]">
                        {formatDate(pr.updated_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-[color:var(--color-muted-foreground)]">
                第 {currentPage} / {totalPages} 页 · 共 {data.count} 条
              </span>
              <div className="flex gap-2">
                <Link
                  href={buildLink(currentPage - 1)}
                  className={`rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium transition-colors ${
                    currentPage <= 1
                      ? "pointer-events-none opacity-40"
                      : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
                  }`}
                >
                  上一页
                </Link>
                <Link
                  href={buildLink(currentPage + 1)}
                  className={`rounded-md border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium transition-colors ${
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-40"
                      : "text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
                  }`}
                >
                  下一页
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
