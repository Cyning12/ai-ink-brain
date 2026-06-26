import type { IssueFilter } from "@/lib/ops/data";

const SCAN_TAG_STYLES: { prefix: string; className: string }[] = [
  { prefix: "C3", className: "bg-red-100 text-red-800 border-red-200" },
  { prefix: "C2", className: "bg-amber-100 text-amber-800 border-amber-200" },
  { prefix: "OBSERVE", className: "bg-sky-100 text-sky-800 border-sky-200" },
  { prefix: "P0", className: "bg-rose-100 text-rose-800 border-rose-200" },
  { prefix: "P1", className: "bg-orange-100 text-orange-800 border-orange-200" },
  { prefix: "P2", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
];

const DEFAULT_TAG_STYLE =
  "bg-[color:var(--color-wash)] text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]";

export function scanTagStyle(tag: string): string {
  const match = SCAN_TAG_STYLES.find(({ prefix }) => tag.startsWith(prefix));
  return match?.className ?? DEFAULT_TAG_STYLE;
}

export function parseFilter(searchParams: {
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

  const scanTag =
    typeof searchParams.scan_tag === "string" && searchParams.scan_tag
      ? searchParams.scan_tag
      : undefined;

  const moduleId =
    typeof searchParams.module_id === "string" && searchParams.module_id
      ? searchParams.module_id
      : undefined;

  const numbersParam = searchParams.numbers;
  const numbers =
    typeof numbersParam === "string"
      ? numbersParam
          .split(",")
          .map((n) => parseInt(n.trim(), 10))
          .filter((n) => Number.isFinite(n) && n > 0)
      : undefined;

  const page =
    typeof searchParams.page === "string"
      ? Math.max(1, parseInt(searchParams.page, 10) || 1)
      : 1;

  return { state, labels, scanTag, moduleId, numbers, page, pageSize: 25 };
}

export function hasActiveIssueFilters(filter: IssueFilter): boolean {
  return Boolean(
    filter.state ||
      (filter.labels && filter.labels.length > 0) ||
      filter.scanTag ||
      filter.moduleId ||
      (filter.numbers && filter.numbers.length > 0),
  );
}

export function buildQueryString(
  filter: IssueFilter,
  overrides?: Partial<IssueFilter>,
): string {
  const params = new URLSearchParams();
  const merged = { ...filter, ...overrides };
  if (merged.state) params.set("state", merged.state);
  if (merged.labels && merged.labels.length > 0)
    params.set("labels", merged.labels.join(","));
  if (merged.scanTag) params.set("scan_tag", merged.scanTag);
  if (merged.moduleId) params.set("module_id", merged.moduleId);
  if (merged.numbers && merged.numbers.length > 0) {
    params.set("numbers", merged.numbers.join(","));
  }
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
