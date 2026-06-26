import Link from "next/link";

import {
  getKimiCodeRepo,
  getLatestGraphSnapshot,
  getGraphModuleIssuesFromBff,
  OpsDataError,
  type GraphSnapshotSummary,
  type GraphModuleRow,
} from "@/lib/ops/data";
import { formatDateTime } from "@/lib/ops/format";

export const dynamic = "force-dynamic";

type PageData =
  | { kind: "loaded"; snapshot: GraphSnapshotSummary | null; modules: GraphModuleRow[] }
  | { kind: "no-repo" }
  | { kind: "error"; message: string };

async function loadPageData(): Promise<PageData> {
  try {
    const repo = await getKimiCodeRepo();
    if (!repo) {
      return { kind: "no-repo" };
    }
    const [snapshot, modules] = await Promise.all([
      getLatestGraphSnapshot(repo.id),
      getGraphModuleIssuesFromBff(),
    ]);
    return { kind: "loaded", snapshot, modules };
  } catch (err) {
    const message =
      err instanceof OpsDataError
        ? err.message
        : "加载 Graph 数据失败，请检查环境变量与 Supabase 连接";
    return { kind: "error", message };
  }
}

function ModuleMatrix({ modules }: { modules: GraphModuleRow[] }) {
  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-muted)] p-8 text-center">
        <p className="text-[color:var(--color-muted-foreground)]">
          暂无模块数据
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)] opacity-70">
          请确认 graph ingest 已运行
        </p>
      </div>
    );
  }

  const maxIssueCount = Math.max(...modules.map((m) => m.issue_count), 1);

  return (
    <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-muted)]">
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              模块
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              Issues
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              Open
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              P0
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              P1
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              P2
            </th>
            <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">
              Issue 编号
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[color:var(--color-border)]">
          {modules.map((mod) => (
            <tr
              key={mod.module_id}
              className="transition-colors hover:bg-[color:var(--color-wash)]/50"
            >
              <td className="px-4 py-3 font-medium text-[color:var(--color-foreground)]">
                {mod.module_name}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-[color:var(--color-foreground)]">
                    {mod.issue_count}
                  </span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[color:var(--color-border)]">
                    <div
                      className="h-full rounded-full bg-[color:var(--color-foreground)] opacity-60"
                      style={{
                        width: `${(mod.issue_count / maxIssueCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-[color:var(--color-foreground)]">
                {mod.open_count}
              </td>
              <td className="px-4 py-3">
                {mod.p0_count > 0 ? (
                  <span className="inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 border-rose-200">
                    {mod.p0_count}
                  </span>
                ) : (
                  <span className="text-xs text-[color:var(--color-muted-foreground)]">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {mod.p1_count > 0 ? (
                  <span className="inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 border-orange-200">
                    {mod.p1_count}
                  </span>
                ) : (
                  <span className="text-xs text-[color:var(--color-muted-foreground)]">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {mod.p2_count > 0 ? (
                  <span className="inline-flex rounded-md border px-1.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 border-yellow-200">
                    {mod.p2_count}
                  </span>
                ) : (
                  <span className="text-xs text-[color:var(--color-muted-foreground)]">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {mod.issue_numbers.slice(0, 8).map((num) => (
                    <Link
                      key={num}
                      href={`/ops/kimi-code/issues?state=open&module_id=${encodeURIComponent(mod.module_id)}`}
                      className="inline-flex rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-wash)] px-1.5 py-0.5 text-xs text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)] hover:underline"
                    >
                      #{num}
                    </Link>
                  ))}
                  {mod.issue_numbers.length > 8 && (
                    <span className="text-xs text-[color:var(--color-muted-foreground)]">
                      +{mod.issue_numbers.length - 8}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SnapshotSummary({ snapshot }: { snapshot: GraphSnapshotSummary | null }) {
  if (!snapshot) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-muted)] p-5">
        <p className="text-xs text-[color:var(--color-muted-foreground)]">
          GRAPH_SNAPSHOT
        </p>
        <p className="mt-2 font-serif text-lg font-semibold text-[color:var(--color-foreground)]">
          尚未 ingest
        </p>
        <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
          未找到 graph snapshot 记录 · 请在 api-python 仓触发 ops-sync-kimi-code
        </p>
      </div>
    );
  }

  const versionLabel =
    snapshot.manifest_version ?? snapshot.source_branch ?? "unknown";

  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[color:var(--color-muted-foreground)]">
            GRAPH_SNAPSHOT · {versionLabel}
          </p>
          <p className="mt-2 font-serif text-2xl font-semibold text-[color:var(--color-foreground)]">
            {snapshot.node_count} nodes · {snapshot.edge_count} edges
          </p>
        </div>
        {snapshot.schema_version && (
          <span className="shrink-0 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-wash)] px-2 py-1 text-xs text-[color:var(--color-muted-foreground)]">
            {snapshot.schema_version}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-[color:var(--color-muted-foreground)]">
        <span>{snapshot.graph_count} graphs</span>
        {snapshot.source_branch && <span>branch {snapshot.source_branch}</span>}
        {snapshot.freeze_id && (
          <span className="truncate" title={snapshot.freeze_id}>
            freeze {snapshot.freeze_id}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-[color:var(--color-muted-foreground)]">
        创建于 {formatDateTime(snapshot.created_at)}
      </p>
    </div>
  );
}

export default async function OpsKimiCodeGraphPage() {
  const data = await loadPageData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Graph
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
          <SnapshotSummary snapshot={data.snapshot} />

          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
              模块 × Issue 矩阵
            </h2>
            <ModuleMatrix modules={data.modules} />
          </div>
        </>
      )}
    </div>
  );
}
