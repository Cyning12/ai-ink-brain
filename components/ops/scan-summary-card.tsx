import { formatDateTime } from "@/lib/ops/format";
import type { ScanSnapshotSummary } from "@/lib/ops/data";

export function ScanSummaryCard({
  snapshot,
}: {
  snapshot: ScanSnapshotSummary | null;
}) {
  if (!snapshot) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-muted)] p-5">
        <p className="text-xs text-[color:var(--color-muted-foreground)]">
          ISSUE_SCAN
        </p>
        <p className="mt-2 font-serif text-lg font-semibold text-[color:var(--color-foreground)]">
          尚未 ingest
        </p>
        <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
          未找到 scan snapshot 记录
        </p>
      </div>
    );
  }

  const p0Count = snapshot.p0_items.length;
  const p1Count = snapshot.p1_items.length;
  const p2Count = snapshot.p2_items.length;
  const total = snapshot.total_open ?? p0Count + p1Count + p2Count;

  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[color:var(--color-muted-foreground)]">
            ISSUE_SCAN · {snapshot.scan_version}
          </p>
          <p className="mt-2 font-serif text-2xl font-semibold text-[color:var(--color-foreground)]">
            {total} open
          </p>
        </div>
        {snapshot.raw_markdown_url && (
          <a
            href={snapshot.raw_markdown_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-xs text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] hover:underline"
          >
            主索引
          </a>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm">
        <span className="font-medium text-rose-700">P0 {p0Count}</span>
        <span className="font-medium text-orange-700">P1 {p1Count}</span>
        <span className="font-medium text-yellow-700">P2 {p2Count}</span>
      </div>

      <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
        创建于 {formatDateTime(snapshot.created_at)}
      </p>
    </div>
  );
}
