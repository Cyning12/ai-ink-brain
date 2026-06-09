/**
 * admin/sync · admin/ingest 服务端密钥（禁止 NEXT_PUBLIC_ 前缀进浏览器 bundle）。
 * 优先级：SYNC_ADMIN_SECRET → CHAT_API_SECRET → NEXT_PUBLIC_ADMIN_SECRET（废弃回退，2026-06-30 后移除）。
 */
let legacyFallbackWarned = false;

export function getSyncAdminSecret(): string | undefined {
  const primary = process.env.SYNC_ADMIN_SECRET?.trim();
  if (primary) return primary;

  const legacyName = process.env.CHAT_API_SECRET?.trim();
  if (legacyName) return legacyName;

  const deprecated = process.env.NEXT_PUBLIC_ADMIN_SECRET?.trim();
  if (deprecated) {
    if (!legacyFallbackWarned && process.env.NODE_ENV !== "production") {
      legacyFallbackWarned = true;
      console.warn(
        "[auth] admin/sync：未配置 SYNC_ADMIN_SECRET，回退 NEXT_PUBLIC_ADMIN_SECRET（已废弃 · 请迁移至 SYNC_ADMIN_SECRET）",
      );
    }
    return deprecated;
  }

  return undefined;
}

/** 文档 / RUNBOOK 用的 shell 别名说明（非 env 键名） */
export const SYNC_ADMIN_SECRET_DOC_ALIAS = "ADMIN_TOKEN";
