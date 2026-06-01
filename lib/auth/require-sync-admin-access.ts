import { timingSafeEqual } from "node:crypto";
import { validateAdmin } from "@/lib/auth";
import { getSyncAdminSecret } from "@/lib/auth/sync-admin-env";

function tokensMatch(token: string, expected: string): boolean {
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(token, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  } catch {
    return false;
  }
}

function bearerFromRequest(request: Request): string {
  const raw = request.headers.get("authorization")?.trim() ?? "";
  if (raw.toLowerCase().startsWith("bearer ")) return raw.slice(7).trim();
  return raw;
}

/**
 * admin/sync · admin/ingest 入站鉴权：
 * 1. Ink admin session / Bearer（validateAdmin）
 * 2. Authorization: Bearer <SYNC_ADMIN_SECRET>
 * 3. x-admin-token（废弃 · 兼容至 2026-06-30）
 */
export function requireSyncAdminAccess(request: Request): Response | null {
  const expected = getSyncAdminSecret();
  if (!expected) {
    return Response.json(
      {
        ok: false,
        error:
          "服务端未配置 SYNC_ADMIN_SECRET（或兼容 CHAT_API_SECRET）；admin/sync 不再使用 NEXT_PUBLIC_ADMIN_SECRET 作为主配置",
      },
      { status: 500 },
    );
  }

  if (validateAdmin(request)) return null;

  const bearer = bearerFromRequest(request);
  if (tokensMatch(bearer, expected)) return null;

  const xAdmin = request.headers.get("x-admin-token")?.trim() ?? "";
  if (xAdmin && tokensMatch(xAdmin, expected)) return null;

  return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
}
