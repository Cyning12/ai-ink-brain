/** Ops Desk M0 环境变量读取（Edge / Node 均可）。 */

export function getOpsDeskSecret(): string | undefined {
  return process.env.OPS_DESK_SECRET?.trim() || undefined;
}

export function getOpsDeskMaintainerSecret(): string | undefined {
  return process.env.OPS_DESK_MAINTAINER_SECRET?.trim() || undefined;
}

export function getOpsDeskDemoToken(): string | undefined {
  return process.env.OPS_DESK_DEMO_TOKEN?.trim() || undefined;
}

/** 返回秒数；未设或非法值时返回 undefined（session cookie）。 */
export function getOpsDeskSessionTtlSeconds(): number | undefined {
  const raw = process.env.OPS_DESK_SESSION_TTL_HOURS?.trim();
  if (!raw) return undefined;
  const hours = Number(raw);
  if (!Number.isFinite(hours) || hours <= 0) return undefined;
  return Math.floor(hours * 3600);
}
