/**
 * Session Orchestrator 功能开关。
 * 生产构建默认关闭（远端 Python 无持久卷时无法落盘 session）；
 * 本地 `pnpm dev` 默认开启。可用 NEXT_PUBLIC_OPS_SESSIONS_ENABLED 覆盖。
 */
export function isOpsSessionsFeatureEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_OPS_SESSIONS_ENABLED?.trim().toLowerCase();
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return process.env.NODE_ENV !== "production";
}
