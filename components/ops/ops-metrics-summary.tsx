"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { MetricCard } from "@/components/ops/metric-card";
import {
  formatDemoCacheHitRate,
  formatMetricsRouteLabel,
  METRICS_SUMMARY_DAY_OPTIONS,
  parseMetricsSummaryDays,
  type MetricsSummaryResponse,
} from "@/lib/ops/metrics-summary";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; data: MetricsSummaryResponse };

function formatCount(value: number): string {
  return Number.isFinite(value) ? value.toLocaleString("zh-CN") : "0";
}

async function fetchMetricsSummary(windowDays: number): Promise<LoadState> {
  try {
    const res = await fetch(`/api/ops/metrics/summary?days=${windowDays}`, {
      credentials: "same-origin",
    });
    if (!res.ok) {
      let message = `加载失败（HTTP ${res.status}）`;
      try {
        const body = (await res.json()) as { error?: string; detail?: string };
        if (body.error) {
          message = body.detail ? `${body.error}：${body.detail}` : body.error;
        }
      } catch {
        // 非 JSON 错误体时保留默认文案
      }
      return { kind: "error", message };
    }
    const data = (await res.json()) as MetricsSummaryResponse;
    return { kind: "loaded", data };
  } catch {
    return { kind: "error", message: "无法连接 Metrics 服务，请稍后重试" };
  }
}

export function OpsMetricsSummary() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const days = parseMetricsSummaryDays(searchParams.get("days"));
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    void fetchMetricsSummary(days).then((nextState) => {
      if (!cancelled) {
        setState(nextState);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [days]);

  const onDaysChange = (nextDays: number) => {
    setState({ kind: "loading" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("days", String(nextDays));
    router.replace(`?${params.toString()}`);
  };

  const routeRows =
    state.kind === "loaded"
      ? Object.entries(state.data.by_route).sort(([a], [b]) => a.localeCompare(b))
      : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Metrics
          </h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            最近 {days} 日 LLM 用量与 Demo 缓存摘要
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[color:var(--color-muted-foreground)]">窗口</span>
          <div className="inline-flex rounded-lg border border-[color:var(--color-border)] p-0.5">
            {METRICS_SUMMARY_DAY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onDaysChange(option)}
                className={[
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  days === option
                    ? "bg-[color:var(--color-wash)] text-[color:var(--color-foreground)]"
                    : "text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]",
                ].join(" ")}
                aria-pressed={days === option}
              >
                {option} 天
              </button>
            ))}
          </div>
        </div>
      </div>

      {state.kind === "loading" && (
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-8 text-center text-sm text-[color:var(--color-muted-foreground)]">
          加载 Metrics 摘要…
        </div>
      )}

      {state.kind === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p className="font-medium">加载失败</p>
          <p className="mt-1 text-sm">{state.message}</p>
        </div>
      )}

      {state.kind === "loaded" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="总 Runs"
              value={formatCount(state.data.total_runs)}
              subtext={`窗口 ${state.data.window_days} 天`}
            />
            <MetricCard
              label="总 Tokens"
              value={formatCount(state.data.total_tokens)}
              subtext="metrics_json.llm 汇总"
            />
            <MetricCard
              label="LLM 调用次数"
              value={formatCount(state.data.total_llm_calls)}
              subtext="llm.usage 事件"
            />
            <MetricCard
              label="Demo 缓存命中率"
              value={formatDemoCacheHitRate(state.data.cache_hit_rate)}
              subtext={`Demo 缓存 · 命中 ${formatCount(state.data.cache_hits)} / 未命中 ${formatCount(state.data.cache_misses)}`}
            />
          </div>

          <div className="space-y-3">
            <h2 className="font-serif text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
              按 Route
            </h2>
            {routeRows.length === 0 ? (
              <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5 text-sm text-[color:var(--color-muted-foreground)]">
                当前窗口无 run 数据
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[color:var(--color-border)]">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[color:var(--color-border)] bg-[color:var(--color-wash)]">
                    <tr>
                      <th className="px-4 py-3 font-medium text-[color:var(--color-muted-foreground)]">
                        Route
                      </th>
                      <th className="px-4 py-3 font-medium text-[color:var(--color-muted-foreground)]">
                        Runs
                      </th>
                      <th className="px-4 py-3 font-medium text-[color:var(--color-muted-foreground)]">
                        Tokens
                      </th>
                      <th className="px-4 py-3 font-medium text-[color:var(--color-muted-foreground)]">
                        LLM Calls
                      </th>
                      <th className="px-4 py-3 font-medium text-[color:var(--color-muted-foreground)]">
                        Demo 缓存命中
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeRows.map(([route, stats]) => (
                      <tr
                        key={route}
                        className="border-b border-[color:var(--color-border)] last:border-b-0"
                      >
                        <td className="px-4 py-3 font-medium text-[color:var(--color-foreground)]">
                          {formatMetricsRouteLabel(route)}
                        </td>
                        <td className="px-4 py-3 text-[color:var(--color-foreground)]">
                          {formatCount(stats.runs)}
                        </td>
                        <td className="px-4 py-3 text-[color:var(--color-foreground)]">
                          {formatCount(stats.tokens)}
                        </td>
                        <td className="px-4 py-3 text-[color:var(--color-foreground)]">
                          {formatCount(stats.llm_calls)}
                        </td>
                        <td className="px-4 py-3 text-[color:var(--color-foreground)]">
                          {formatCount(stats.cache_hits)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
