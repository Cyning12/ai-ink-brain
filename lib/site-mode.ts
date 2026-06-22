/** Portfolio / Ops 演示模式 vs 日常 development；读取 NEXT_PUBLIC_SITE_MODE（构建期内联）。 */

export type SiteMode = "portfolio" | "development" | "ops";

/** 解析 env 原始值；未设或非法值等同 development（SPEC §4.1 · §6.3 · F1）。 */
export function parseSiteMode(raw: string | undefined): SiteMode {
  if (raw === "portfolio") return "portfolio";
  if (raw === "ops") return "ops";
  return "development";
}

/** 当前站点模式（Server / Client 均可；NEXT_PUBLIC_* 构建期常量）。 */
export function getSiteMode(): SiteMode {
  return parseSiteMode(process.env.NEXT_PUBLIC_SITE_MODE);
}

export function isPortfolioMode(): boolean {
  return getSiteMode() === "portfolio";
}

export function isOpsMode(): boolean {
  return getSiteMode() === "ops";
}
