import {
  getKimiCodeRepo,
  getLatestScanSnapshot,
  getOverviewMetrics,
  getRecentSyncRuns,
  OpsDataError,
  type OverviewMetrics,
  type ScanSnapshotSummary,
  type SyncRunListItem,
} from "@/lib/ops/data";
import { formatDurationDays } from "@/lib/ops/format";
import { MetricCard } from "@/components/ops/metric-card";
import { ScanSummaryCard } from "@/components/ops/scan-summary-card";
import { SyncStatus } from "@/components/ops/sync-status";
import { TrendChart } from "@/components/ops/trend-chart";
import { ManualSyncButton } from "@/components/ops/manual-sync-button";
import { SyncRunHistory } from "@/components/ops/sync-run-history";
import { getOpsDeskSessionFromRequest } from "@/lib/auth/ops-session";
import { getOpsDeskSecret } from "@/lib/auth/ops-env";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type PageData =
  | { kind: "loaded"; metrics: OverviewMetrics; scanSnapshot: ScanSnapshotSummary | null; syncRuns: SyncRunListItem[]; isMaintainer: boolean }
  | { kind: "no-repo" }
  | { kind: "error"; message: string };

async function loadPageData(): Promise<PageData> {
  try {
    const repo = await getKimiCodeRepo();
    if (!repo) {
      return { kind: "no-repo" };
    }
    const [metrics, scanSnapshot, syncRuns] = await Promise.all([
      getOverviewMetrics(repo.id),
      getLatestScanSnapshot(repo.id),
      getRecentSyncRuns(repo.id, 10),
    ]);

    const secret = getOpsDeskSecret();
    let isMaintainer = false;
    if (secret) {
      const h = await headers();
      const session = await getOpsDeskSessionFromRequest(
        new Request("http://localhost", { headers: h }),
        secret,
      );
      isMaintainer = session?.role === "maintainer";
    }

    return { kind: "loaded", metrics, scanSnapshot, syncRuns, isMaintainer };
  } catch (err) {
    const message =
      err instanceof OpsDataError
        ? err.message
        : "加载总览数据失败，请检查环境变量与 Supabase 连接";
    return { kind: "error", message };
  }
}

export default async function OpsKimiCodeOverviewPage() {
  const data = await loadPageData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Kimi Code 总览
        </h1>
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SyncStatus
              status={data.metrics.syncStatus}
              syncRun={data.metrics.syncRun}
              asOf={data.metrics.asOf}
            />
            {data.isMaintainer && (
              <ManualSyncButton
                disabled={data.metrics.syncStatus === "running"}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard
              label="PR Cycle Time"
              value={formatDurationDays(data.metrics.cycleTime.medianDays)}
              subtext={
                data.metrics.cycleTime.sampleSize > 0
                  ? `近 30 天 ${data.metrics.cycleTime.sampleSize} 条 merged PR`
                  : "近 30 天无 merged PR"
              }
            />
            <MetricCard
              label="PR Review Time"
              value={formatDurationDays(data.metrics.reviewTime.medianDays)}
              subtext={
                data.metrics.reviewTime.sampleSize > 0
                  ? `近 30 天 ${data.metrics.reviewTime.sampleSize} 条含 review PR`
                  : "近 30 天无 review 记录"
              }
            />
            <MetricCard
              label="Issue Throughput"
              value={
                data.metrics.issueThroughput.count > 0
                  ? String(data.metrics.issueThroughput.count)
                  : "—"
              }
              subtext={`近 ${data.metrics.issueThroughput.periodDays} 天 closed issues`}
            />
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
              Scan 摘要
            </h2>
            <ScanSummaryCard snapshot={data.scanSnapshot} />
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
              同步历史
            </h2>
            <SyncRunHistory runs={data.syncRuns} />
          </div>

          <TrendChart data={data.metrics.trend} />
        </>
      )}
    </div>
  );
}
