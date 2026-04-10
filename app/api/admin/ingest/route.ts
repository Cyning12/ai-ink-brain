import { requireNextPublicAdminSecret } from "@/lib/auth/require-next-public-admin-secret";
import { forwardToPyAdmin } from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * 全量同步 content/ → Supabase documents（实现位于 Python api/ingest_pipeline.py）。
 *
 * 触发示例：
 * curl -sS -X POST -H "Authorization: Bearer $NEXT_PUBLIC_ADMIN_SECRET" http://localhost:3000/api/admin/ingest
 */
export async function POST(req: Request): Promise<Response> {
  const denied = requireNextPublicAdminSecret(req);
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
