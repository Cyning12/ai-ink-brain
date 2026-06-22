import Link from "next/link";

import {
  getIssues,
  getKimiCodeRepo,
  OpsDataError,
  type IssueFilter,
  type IssueRow,
} from "@/lib/ops/data";
import { formatDateTime } from "@/lib/ops/format";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

const SCAN_TAG_COLORS: Record<string, string> = {
  C2: "bg-amber-100 text-amber-800 border-amber-200",
  C3: "bg-red-100 text-red-800 border-red-200",
  OBSERVE: "bg-sky-100 text-sky-800 border-sky-200",
  P0: "bg-rose-100 text-rose-800 border-rose-200",
  P1: "bg-orange-100 text-orange-800 border-orange-200",
  P2: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const DEFAULT_TAG_STYLE =
  "bg-[color:var(--color-wash)] text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]";

function scanTagStyle(tag: string): string {
  return SCAN_TAG_COLORS[tag] ?? DEFAULT_TAG_STYLE;
}

function stateStyle(state: string): string {
  return state === "open"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : "bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]";
}

function parseFilter(searchParams: {
  [key: string]: string | string[] | undefined;
}): IssueFilter {
  const state =
    searchParams.state === "open" || searchParams.state === "closed"
      ? searchParams.state
      : undefined;

  const labelsParam = searchParams.labels;
  const labels =
    typeof labelsParam === "string"
      ? labelsParam.split(",").filter(Boolean)
      : undefined;

  const page =
    typeof searchParams.page === "string"
      ? Math.max(1, parseInt(searchParams.page, 10) || 1)
      : 1;

  return { state, labels, page, pageSize: PAGE_SIZE };
}

function buildQueryString(
  filter: IssueFilter,
  overrides?: Partial<IssueFilter>,
): string {
  const params = new URLSearchParams();
  const merged = { ...filter, ...overrides };
  if (merged.state) params.set("state", merged.state);
  if (merged.labels && merged.labels.length > 0)
    params.set("labels", merged.labels.join(","));
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
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
}: {
  filter: IssueFilter;
  allLabels: string[];
}) {
  const currentLabels = filter.labels ?? [];

  function toggleLabel(label: string): string[] {
    if (currentLabels.includes(label)) {
      return currentLabels.filter((l) => l !== label);
    }
    return [...currentLabels, label];
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
    </div>
  );
}

type PageData =
  | { kind: "loaded"; rows: IssueRow[]; count: number; allLabels: string[] }
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
    for (const issue of rows) {
      for (const label of issue.labels) {
        labelSet.add(label);
      }
    }
    const allLabels = Array.from(labelSet).sort();

    return { kind: "loaded", rows, count, allLabels };
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
          <FilterBar filter={filter} allLabels={data.allLabels} />

          {data.rows.length === 0 ? (
            <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-muted)] p-8 text-center">
              <p className="text-[color:var(--color-muted-foreground)]">
                暂无 Issue 数据
              </p>
              <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)] opacity-70">
                {filter.state ||
                (filter.labels && filter.labels.length > 0)
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
