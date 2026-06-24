import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { parseMetricsSummaryDays } from "@/lib/ops/metrics-summary";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

export const runtime = "nodejs";

/** GET /api/ops/metrics/summary → Python GET /api/py/ops/metrics/summary */
export async function GET(request: Request): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const days = parseMetricsSummaryDays(url.searchParams.get("days"));

  return forwardOpsRequest(
    `/api/py/ops/metrics/summary?days=${encodeURIComponent(String(days))}`,
    { method: "GET" },
  );
}
