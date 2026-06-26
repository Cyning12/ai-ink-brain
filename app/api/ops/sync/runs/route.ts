import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/sync/runs → Python GET /api/py/ops/sync/runs */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const limit = url.searchParams.get("limit") ?? "10";
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
  return forwardOpsRequest(
    `/api/py/ops/sync/runs?limit=${encodeURIComponent(String(safeLimit))}`,
    { method: "GET" },
    request,
  );
}
