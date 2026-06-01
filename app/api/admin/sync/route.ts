import { requireSyncAdminAccess } from "@/lib/auth/require-sync-admin-access";
import { forwardToPyAdmin } from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * 触发：POST /api/admin/sync → Python /api/py/admin/sync
 * 查询：GET /api/admin/sync?jobId=... → Python
 *
 * 维护者 curl（推荐 Bearer · 服务端密钥）：
 * curl -sS -X POST "http://localhost:3000/api/admin/sync" \
 *   -H "Authorization: Bearer $SYNC_ADMIN_SECRET"
 *
 * 直连 Python（投递计划 §3.3）：
 * curl -sS -X POST "$PY_API_URL/api/py/admin/sync" \
 *   -H "Authorization: Bearer $ADMIN_TOKEN"
 *
 * 废弃：x-admin-token + NEXT_PUBLIC_ADMIN_SECRET（见 SPEC-portfolio_admin_sync_auth_v1_zh.md）
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireSyncAdminAccess(request);
  if (denied) return denied;

  const res = await forwardToPyAdmin("/api/py/admin/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return passthrough(res);
}

export async function GET(request: Request): Promise<Response> {
  const denied = requireSyncAdminAccess(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId")?.trim() ?? "";
  if (!jobId) {
    return Response.json(
      { ok: false, error: "Missing required query param: jobId" },
      { status: 400 },
    );
  }

  const res = await forwardToPyAdmin(
    `/api/py/admin/sync?jobId=${encodeURIComponent(jobId)}`,
    { method: "GET" },
  );
  return passthrough(res);
}

async function passthrough(res: Response): Promise<Response> {
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
