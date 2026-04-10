import { validateAdmin } from "@/lib/auth";
import { forwardToPyAdmin } from "@/lib/py-service-proxy";

export const runtime = "nodejs";

function deny(status: number) {
  return Response.json({ ok: false, error: "Forbidden" }, { status });
}

function requireAdminToken(request: Request): Response | null {
  const expected = process.env.NEXT_PUBLIC_ADMIN_SECRET?.trim();
  if (!expected) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量 NEXT_PUBLIC_ADMIN_SECRET" },
      { status: 500 },
    );
  }

  const token = request.headers.get("x-admin-token")?.trim() ?? "";
  if (token) {
    if (token !== expected) return deny(403);
    return null;
  }

  if (!validateAdmin(request)) return deny(403);
  return null;
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

/**
 * 触发：POST /api/admin/sync → Python /api/py/admin/sync
 * 查询：GET /api/admin/sync?jobId=... → Python
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const res = await forwardToPyAdmin("/api/py/admin/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return passthrough(res);
}

export async function GET(request: Request): Promise<Response> {
  const denied = requireAdminToken(request);
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
