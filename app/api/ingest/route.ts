import { requireBearerSecret } from "@/lib/auth/require-bearer-secret";
import { processUploadedFile } from "@/lib/ingest/process-file-upload";

export const runtime = "nodejs";

/**
 * 数据入库：仅管理员（Bearer INGEST_ADMIN_SECRET）。
 * curl 示例：
 * curl -H "Authorization: Bearer $INGEST_ADMIN_SECRET" -F file=@note.mdx http://localhost:3001/api/ingest
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireBearerSecret(request, "INGEST_ADMIN_SECRET");
  if (denied) return denied;

  try {
    const result = await processUploadedFile(request);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      message.startsWith("Missing") || message.includes("Unsupported")
        ? 400
        : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}
