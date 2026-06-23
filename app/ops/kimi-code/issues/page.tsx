import Link from "next/link";

import {
  getIssues,
  getKimiCodeRepo,
  OpsDataError,
  type IssueFilter,
  type IssueRow,
} from "@/lib/ops/data";
import { formatDateTime } from "@/lib/ops/format";
import {
  buildQueryString,
  parseFilter,
  scanTagStyle,
} from "@/lib/ops/filter";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

function stateStyle(state: string): string {
  return state === "open"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]";
}

function IssueTable({ rows }: { rows: IssueRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-muted)]">
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              #
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              标题
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              状态
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              标签
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              Scan
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              更新于
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--color-border)]">
          {rows.map((issue) => (
            <tr
              key={issue.id}
              className="transition-colors hover:bg-[color:var(--color-wash)]/50"
            >
              <td className="whitespace-nowrap px-4 py-3">
                <a
                  href={issue.html_url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[color:var(--color-foreground)] hover:underline"
                >
                  #{issue.number}
                </a>
              </td>
              <td className="px-4 py-3">
                <a
                  href={issue.html_url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--color-foreground)] hover:underline"
                  title={issue.title}
                >
                  {issue.title}
                </a>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${stateStyle(issue.state)}`}
                >
                  {issue.state === "open" ? "Open" : "Closed"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {issue.labels.map((label) => (
                    <span
                      key={label}
                      className="inline-flex rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-wash)] px-1.5 py-0.5 text-xs text-[color:var(--color-muted-foreground)]"
                    >
                      {label}
                    </span>
                  ))}
                  {issue.labels.length === 0 && (
                    <span className="text-xs text-[color:var(--color-muted-foreground)] opacity-50">
                      —
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {issue.scan_tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium ${scanTagStyle(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                  {issue.scan_tags.length === 0 && (
                    <span className="text-xs text-[color:var(--color-muted-foreground)] opacity-50">
                      —
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-[color:var(--color-muted-foreground)]">
                {formatDateTime(issue.updated_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({
  filter,
  total,
}: {
  filter: IssueFilter;
  total: number;
}) {
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[color:var(--color-muted-foreground)]">
        共 {total} 条 · 第 {page} / {totalPages} 页
      </p>
      <div className="flex gap-2">
        <Link
          href={`/ops/kimi-code/issues${buildQueryString(filter, { page: page - 1 })}`}
          className={`rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm transition-colors ${
            hasPrev
              ? "bg-[color:var(--color-background)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
              : "pointer-events-none opacity-40"
          }`}
        >
          上一页
        </Link>
        <Link
          href={`/ops/kimi-code/issues${buildQueryString(filter, { page: page + 1 })}`}
          className={`rounded-lg border border-[color:var(--color-border)] px-3 py-1.5 text-sm transition-colors ${
            hasNext
              ? "bg-[color:var(--color-background)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
              : "pointer-events-none opacity-40"
          }`}
        >
          下一页
        </Link>
      </div>
    </div>
  );
}

function FilterBar({
  filter,
  allLabels,
  allScanTags,
}: {
  filter: IssueFilter;
  allLabels: string[];
  allScanTags: string[];
}) {
  const currentLabels = filter.labels ?? [];
  const currentScanTag = filter.scanTag;

  function toggleLabel(label: string): string[] {
    if (currentLabels.includes(label)) {
      return currentLabels.filter((l) => l !== label);
    }
    return [...currentLabels, label];
  }

  function toggleScanTag(tag: string): string | undefined {
    return currentScanTag === tag ? undefined : tag;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* State filter */}
      <div className="flex overflow-hidden rounded-lg border border-[color:var(--color-border)]">
        {([undefined, "open", "closed"] as const).map((s) => (
          <Link
            key={String(s)}
            href={`/ops/kimi-code/issues${buildQueryString(filter, { state: s, page: 1 })}`}
            className={`px-3 py-1.5 text-sm transition-colors ${
              filter.state === s
                ? "bg-[color:var(--color-foreground)] text-[color:var(--color-background)]"
                : "bg-[color:var(--color-background)] text-[color:var(--color-foreground)] hover:bg-[color:var(--color-wash)]"
            }`}
          >
            {s === undefined ? "全部" : s === "open" ? "Open" : "Closed"}
          </Link>
        ))}
      </div>

      {/* Label filter */}
      {allLabels.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[color:var(--color-muted-foreground)]">
            标签:
          </span>
          {allLabels.map((label) => {
            const active = currentLabels.includes(label);
            return (
              <Link
                key={label}
                href={`/ops/kimi-code/issues${buildQueryString(filter, { labels: toggleLabel(label), page: 1 })}`}
                className={`rounded-md border px-2 py-0.5 text-xs transition-colors ${
                  active
                    ? "border-[color:var(--color-foreground)] bg-[color:var(--color-foreground)] text-[color:var(--color-background)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-background)] text-[color:var(--color-muted-foreground)] hover:bg-[color:var(--color-wash)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Scan tag filter */}
      {allScanTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[color:var(--color-muted-foreground)]">
            Scan:
          </span>
          {allScanTags.map((tag) => {
            const active = currentScanTag === tag;
            return (
              <Link
                key={tag}
                href={`/ops/kimi-code/issues${buildQueryString(filter, { scanTag: toggleScanTag(tag), page: 1 })}`}
                className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[color:var(--color-foreground)] bg-[color:var(--color-foreground)] text-[color:var(--color-background)]"
                    : scanTagStyle(tag)
                }`}
              >
                {tag}
              </Link>
            );
          })}
        </div>
      )}

      {/* Clear filters */}
      {(filter.state || (filter.labels && filter.labels.length > 0) || filter.scanTag) && (
        <Link
          href="/ops/kimi-code/issues"
          className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          清空所有筛选
        </Link>
      )}
    </div>
  );
}

type PageData =
  | { kind: "loaded"; rows: IssueRow[]; count: number; allLabels: string[]; allScanTags: string[] }
  | { kind: "no-repo" }
  | { kind: "error"; message: string };

async function loadPageData(filter: IssueFilter): Promise<PageData> {
  try {
    const repo = await getKimiCodeRepo();
    if (!repo) {
      return { kind: "no-repo" };
    }
    const { rows, count } = await getIssues(repo.id, filter);

    const labelSet = new Set<string>();
    const scanTagSet = new Set<string>();
    for (const issue of rows) {
      for (const label of issue.labels) {
        labelSet.add(label);
      }
      for (const tag of issue.scan_tags) {
        scanTagSet.add(tag);
      }
    }
    const allLabels = Array.from(labelSet).sort();
    const allScanTags = Array.from(scanTagSet).sort();

    return { kind: "loaded", rows, count, allLabels, allScanTags };
  } catch (err) {
    const message =
      err instanceof OpsDataError
        ? err.message
        : "加载 Issues 数据失败，请检查环境变量与 Supabase 连接";
    return { kind: "error", message };
  }
}

export default async function OpsKimiCodeIssuesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const filter = parseFilter(params);
  const data = await loadPageData(filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Issues
        </h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          MoonshotAI/kimi-code
        </p>
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
          <FilterBar filter={filter} allLabels={data.allLabels} allScanTags={data.allScanTags} />

          {data.rows.length === 0 ? (
            <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)] p-8 text-center">
              <p className="text-[color:var(--color-muted-foreground)]">
                暂无 Issue 数据
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)] opacity-70">
                {filter.state ||
                (filter.labels && filter.labels.length > 0) ||
                filter.scanTag
                  ? "尝试调整筛选条件"
                  : "请确认 GHA sync 已首跑成功"}
              </p>
            </div>
          ) : (
            <>
              <IssueTable rows={data.rows} />
              <Pagination filter={filter} total={data.count} />
            </>
          )}
        </>
      )}
    </div>
  );
}
