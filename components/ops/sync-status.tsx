import { formatDateTime } from "@/lib/ops/format";
import type { SyncRun } from "@/lib/ops/data";

export function SyncStatus({
  status,
  syncRun,
  asOf,
}: {
  status: SyncRun["status"] | "none";
  syncRun: SyncRun | null;
  asOf: string | null;
}) {
  const statusMap: Record<typeof status, { label: string; color: string }> = {
    success: { label: "同步成功", color: "bg-emerald-500" },
    partial: { label: "部分同步", color: "bg-amber-500" },
    failed: { label: "同步失败", color: "bg-red-500" },
    running: { label: "同步中", color: "bg-blue-500" },
    pending: { label: "等待中", color: "bg-slate-400" },
    none: { label: "未找到同步记录", color: "bg-slate-300" },
  };

  const meta = statusMap[status];

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[color:var(--color-muted-foreground)]">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${meta.color}`} />
        <span className="text-[color:var(--color-foreground)]">{meta.label}</span>
      </div>
      <span>数据截至：{formatDateTime(asOf)}</span>
      {syncRun && (
        <span>
          Issue {syncRun.records_issue} · PR {syncRun.records_pr}
        </span>
      )}
      {syncRun?.error_message && (
        <span className="w-full text-red-600">{syncRun.error_message}</span>
      )}
    </div>
  );
}
