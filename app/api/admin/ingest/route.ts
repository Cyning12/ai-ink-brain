import { requireNextPublicAdminSecret } from "@/lib/auth/require-next-public-admin-secret";
import { processMarkdownFiles } from "@/lib/ingest";

export const runtime = "nodejs";

/**
 * 全量同步 content/ → Supabase documents（需 NEXT_PUBLIC_ADMIN_SECRET）。
 *
 * 触发示例：
 * curl -sS -X POST -H "Authorization: Bearer $NEXT_PUBLIC_ADMIN_SECRET" http://localhost:3000/api/admin/ingest
 *
 * 或使用裸密钥（与部分教程一致）：
 * curl -sS -X POST -H "Authorization: $NEXT_PUBLIC_ADMIN_SECRET" http://localhost:3000/api/admin/ingest
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireNextPublicAdminSecret(request);
  if (denied) return denied;

  try {
    const result = await processMarkdownFiles();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      message.startsWith("Missing") || message.includes("未配置")
        ? 500
        : message.includes("维度") || message.includes("Unsupported")
          ? 400
          : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}
