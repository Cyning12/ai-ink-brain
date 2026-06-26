/** Ops Desk M0 环境变量读取（Edge / Node 均可）。 */

/** db = P3-2a 后端 session（默认）；legacy = M0 HMAC Cookie */
export type OpsDeskAuthMode = "db" | "legacy";

/** 与 api-python MIN_DURATION_HOURS 对齐 */
export const OPS_DESK_MIN_SESSION_TTL_HOURS = 0.01;

export function getOpsDeskAuthMode(): OpsDeskAuthMode {
  const raw = process.env.OPS_DESK_AUTH_MODE?.trim().toLowerCase();
  return raw === "legacy" ? "legacy" : "db";
}

export function getOpsDeskSecret(): string | undefined {
  return process.env.OPS_DESK_SECRET?.trim() || undefined;
}

export function getOpsDeskMaintainerSecret(): string | undefined {
  return process.env.OPS_DESK_MAINTAINER_SECRET?.trim() || undefined;
}

export function getOpsDeskDemoToken(): string | undefined {
  return process.env.OPS_DESK_DEMO_TOKEN?.trim() || undefined;
}

/** Session TTL（小时 · 支持小数 · 默认 24） */
export function getOpsDeskSessionTtlHours(): number {
  const raw = process.env.OPS_DESK_SESSION_TTL_HOURS?.trim();
  if (!raw) return 24;
  const hours = Number(raw);
  if (!Number.isFinite(hours) || hours < OPS_DESK_MIN_SESSION_TTL_HOURS) return 24;
  return hours;
}

/** Cookie Max-Age（秒）；legacy 未设 env 时 undefined 表示 session cookie */
export function getOpsDeskSessionTtlSeconds(): number | undefined {
  const raw = process.env.OPS_DESK_SESSION_TTL_HOURS?.trim();
  if (!raw) return undefined;
  const hours = Number(raw);
  if (!Number.isFinite(hours) || hours < OPS_DESK_MIN_SESSION_TTL_HOURS) return undefined;
  return Math.max(1, Math.ceil(hours * 3600));
}

/** 由 Python 返回的 expires_at ISO 推算 Cookie Max-Age（秒） */
export function cookieMaxAgeSecFromExpiresAt(expiresAtIso: string | undefined): number | undefined {
  if (!expiresAtIso) return undefined;
  const ms = new Date(expiresAtIso).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.max(1, Math.ceil(ms / 1000));
}
