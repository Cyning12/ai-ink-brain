import { describe, expect, it } from "vitest";

import {
  formatDemoCacheHitRate,
  formatMetricsRouteLabel,
  formatProviderCacheHitRate,
  isMetricsSummaryDayOption,
  parseMetricsSummaryDays,
  resolveProviderCacheCardContent,
  resolveProviderCacheTokenCount,
} from "@/lib/ops/metrics-summary";

describe("parseMetricsSummaryDays", () => {
  it("默认 7 天", () => {
    expect(parseMetricsSummaryDays(null)).toBe(7);
    expect(parseMetricsSummaryDays("")).toBe(7);
    expect(parseMetricsSummaryDays("abc")).toBe(7);
  });

  it("合法值 clamp 到 1–365", () => {
    expect(parseMetricsSummaryDays("1")).toBe(1);
    expect(parseMetricsSummaryDays("7")).toBe(7);
    expect(parseMetricsSummaryDays("30")).toBe(30);
    expect(parseMetricsSummaryDays("0")).toBe(1);
    expect(parseMetricsSummaryDays("999")).toBe(365);
  });
});

describe("formatDemoCacheHitRate", () => {
  it("小数转百分比，保留两位", () => {
    expect(formatDemoCacheHitRate(0.0328)).toBe("3.28%");
    expect(formatDemoCacheHitRate(0)).toBe("0.00%");
    expect(formatDemoCacheHitRate(1)).toBe("100.00%");
  });

  it("非法值回退 0.00%", () => {
    expect(formatDemoCacheHitRate(Number.NaN)).toBe("0.00%");
  });
});

describe("formatProviderCacheHitRate", () => {
  it("小数转百分比，保留两位", () => {
    expect(formatProviderCacheHitRate(0.6)).toBe("60.00%");
    expect(formatProviderCacheHitRate(0)).toBe("0.00%");
  });

  it("缺失或非有限值显示 —", () => {
    expect(formatProviderCacheHitRate(undefined)).toBe("—");
    expect(formatProviderCacheHitRate(Number.NaN)).toBe("—");
  });
});

describe("resolveProviderCacheCardContent", () => {
  const sample = {
    provider_cache_hit_rate: 0.6,
    provider_cache_hit_tokens: 120,
    provider_cache_miss_tokens: 80,
  };

  it("百炼显示暂未采集", () => {
    const card = resolveProviderCacheCardContent("bailian", sample);
    expect(card.value).toBe("—");
    expect(card.subtext).toBe("Provider KV · 百炼（暂未采集）");
  });

  it("SiliconFlow 显示命中率与 token", () => {
    const card = resolveProviderCacheCardContent("siliconflow", sample);
    expect(card.value).toBe("60.00%");
    expect(card.subtext).toContain("SiliconFlow");
    expect(card.subtext).toContain("120");
  });
});

describe("resolveProviderCacheTokenCount", () => {
  it("缺失字段按 0", () => {
    expect(resolveProviderCacheTokenCount(undefined)).toBe(0);
    expect(resolveProviderCacheTokenCount(315)).toBe(315);
  });
});

describe("formatMetricsRouteLabel", () => {
  it("unknown 显示历史/未标注", () => {
    expect(formatMetricsRouteLabel("unknown")).toBe("历史/未标注");
    expect(formatMetricsRouteLabel("deep")).toBe("deep");
  });
});

describe("isMetricsSummaryDayOption", () => {
  it("识别 1/7/30", () => {
    expect(isMetricsSummaryDayOption(1)).toBe(true);
    expect(isMetricsSummaryDayOption(7)).toBe(true);
    expect(isMetricsSummaryDayOption(30)).toBe(true);
    expect(isMetricsSummaryDayOption(14)).toBe(false);
  });
});
