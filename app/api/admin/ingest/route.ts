import { requireSyncAdminAccess } from "@/lib/auth/require-sync-admin-access";
import { forwardToPyAdmin } from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * 全量同步 content/ → Supabase documents（实现位于 Python api/ingest_pipeline.py）。
 *
 * curl -sS -X POST -H "Authorization: Bearer $SYNC_ADMIN_SECRET" http://localhost:3000/api/admin/ingest
 */
export async function POST(req: Request): Promise<Response> {
  const denied = await requireSyncAdminAccess(req);
  if (denied) return denied;

  const res = await forwardToPyAdmin("/api/py/admin/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}
