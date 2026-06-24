/** Ops Desk LLM usage summary（Python GET /ops/metrics/summary）类型与展示辅助。 */

export type MetricsRouteStats = {
  runs: number;
  tokens: number;
  llm_calls: number;
  cache_hits: number;
};

export type MetricsSummaryResponse = {
  window_days: number;
  total_runs: number;
  total_tokens: number;
  total_llm_calls: number;
  cache_hits: number;
  cache_misses: number;
  cache_hit_rate: number;
  provider_cache_hit_tokens?: number;
  provider_cache_miss_tokens?: number;
  provider_cache_hit_rate?: number;
  by_route: Record<string, MetricsRouteStats>;
};

export const METRICS_SUMMARY_DAY_OPTIONS = [1, 7, 30] as const;

export type MetricsSummaryDayOption = (typeof METRICS_SUMMARY_DAY_OPTIONS)[number];

const DEFAULT_DAYS = 7;
const MIN_DAYS = 1;
const MAX_DAYS = 365;

/** 解析 BFF query `days`：非法或缺失时默认 7，范围 1–365。 */
export function parseMetricsSummaryDays(raw: string | null | undefined): number {
  if (raw == null || raw.trim() === "") {
    return DEFAULT_DAYS;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_DAYS;
  }
  return Math.min(Math.max(parsed, MIN_DAYS), MAX_DAYS);
}

/** Demo 缓存命中率：API 返回 0–1 小数 → 百分比字符串。 */
export function formatDemoCacheHitRate(rate: number): string {
  if (!Number.isFinite(rate)) {
    return "0.00%";
  }
  return `${(rate * 100).toFixed(2)}%`;
}

/** Provider KV 缓存命中率：可选字段 · 缺失时显示 —。 */
export function formatProviderCacheHitRate(rate: number | undefined): string {
  if (rate == null || !Number.isFinite(rate)) {
    return "—";
  }
  return `${(rate * 100).toFixed(2)}%`;
}

/** Provider KV token 计数：旧部署无字段时按 0。 */
export function resolveProviderCacheTokenCount(value: number | undefined): number {
  if (value == null || !Number.isFinite(value)) {
    return 0;
  }
  return value;
}

/** by_route 行标签：unknown 显示为「历史/未标注」。 */
export function formatMetricsRouteLabel(route: string): string {
  if (route === "unknown") {
    return "历史/未标注";
  }
  return route;
}

export function isMetricsSummaryDayOption(value: number): value is MetricsSummaryDayOption {
  return (METRICS_SUMMARY_DAY_OPTIONS as readonly number[]).includes(value);
}
