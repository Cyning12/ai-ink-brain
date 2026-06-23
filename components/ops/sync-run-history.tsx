import { formatDateTime } from "@/lib/ops/format";
import type { SyncRunListItem } from "@/lib/ops/data";
import {
  Zap,
  Calendar,
  GitBranch,
  GitGraph,
  ScanLine,
} from "lucide-react";

export function SyncRunHistory({
  runs,
}: {
  runs: SyncRunListItem[];
}) {
  if (runs.length === 0) {
    return (
      <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-wash)] p-6 text-center text-sm text-[color:var(--color-muted-foreground)]">
        尚无同步记录
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[color:var(--color-border)]">
      <table className="w-full text-sm">
        <thead className="bg-[color:var(--color-wash)] text-left text-xs font-medium text-[color:var(--color-muted-foreground)]">
          <tr>
            <th className="px-4 py-3">时间</th>
            <th className="px-4 py-3">触发</th>
            <th className="px-4 py-3">状态</th>
            <th className="px-4 py-3">Issue</th>
            <th className="px-4 py-3">PR</th>
            <th className="px-4 py-3">产物</th>
            <th className="px-4 py-3">错误</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--color-border)]">
          {runs.map((run) => (
            <SyncRunRow key={run.id} run={run} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SyncRunRow({ run }: { run: SyncRunListItem }) {
  const statusMeta = STATUS_MAP[run.status];

  return (
    <tr className="transition-colors hover:bg-[color:var(--color-wash)]/50">
      <td className="px-4 py-3 whitespace-nowrap text-[color:var(--color-foreground)]">
        {formatDateTime(run.started_at)}
      </td>
      <td className="px-4 py-3">
        <TriggerBadge trigger={run.trigger} />
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${statusMeta.dot}`} />
          <span className="text-[color:var(--color-foreground)]">
            {statusMeta.label}
          </span>
        </span>
      </td>
      <td className="px-4 py-3 text-[color:var(--color-foreground)]">
        {run.records_issue}
      </td>
      <td className="px-4 py-3 text-[color:var(--color-foreground)]">
        {run.records_pr}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {run.has_graph_snapshot && (
            <GitGraph className="h-4 w-4 text-[color:var(--color-muted-foreground)]" />
          )}
          {run.has_scan_snapshot && (
            <ScanLine className="h-4 w-4 text-[color:var(--color-muted-foreground)]" />
          )}
          {!run.has_graph_snapshot && !run.has_scan_snapshot && (
            <span className="text-xs text-[color:var(--color-muted-foreground)]">
              —
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 max-w-xs">
        {run.error_message ? (
          <span
            className="inline-block truncate text-xs text-red-600"
            title={run.error_message}
          >
            {run.error_message}
          </span>
        ) : (
          <span className="text-xs text-[color:var(--color-muted-foreground)]">
            —
          </span>
        )}
      </td>
    </tr>
  );
}

const STATUS_MAP: Record<
  SyncRunListItem["status"],
  { label: string; dot: string }
> = {
  success: { label: "成功", dot: "bg-emerald-500" },
  partial: { label: "部分", dot: "bg-amber-500" },
  failed: { label: "失败", dot: "bg-red-500" },
  running: { label: "进行中", dot: "bg-blue-500 animate-pulse" },
  pending: { label: "等待", dot: "bg-slate-400" },
};

function TriggerBadge({ trigger }: { trigger: SyncRunListItem["trigger"] }) {
  const icons = {
    manual: <Zap className="h-3.5 w-3.5" />,
    cron: <Calendar className="h-3.5 w-3.5" />,
    initial: <GitBranch className="h-3.5 w-3.5" />,
  };

  const labels = {
    manual: "手动",
    cron: "定时",
    initial: "初始",
  };

  const styles = {
    manual: "bg-blue-50 text-blue-700",
    cron: "bg-slate-100 text-slate-700",
    initial: "bg-purple-50 text-purple-700",
  };

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        styles[trigger],
      ].join(" ")}
    >
      {icons[trigger]}
      {labels[trigger]}
    </span>
  );
}
