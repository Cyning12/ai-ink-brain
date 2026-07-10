import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/ops-session", () => ({
  requireOpsDeskAccess: vi.fn(),
}));

vi.mock("@/lib/server/forward-ops-request", () => ({
  forwardOpsRequest: vi.fn(),
}));

import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";
import { GET } from "./route";

describe("GET /api/ops/runs/[runId]/artifacts", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("未授权时返回门闸响应", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(
      Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );

    const res = await GET(
      new Request("http://localhost/api/ops/runs/run-1/artifacts"),
      { params: Promise.resolve({ runId: "run-1" }) },
    );
    expect(res.status).toBe(401);
    expect(forwardOpsRequest).not.toHaveBeenCalled();
  });

  it("授权后转发 upstream GET /api/py/ops/runs/{runId}/artifacts", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(
        JSON.stringify({
          run_id: "run-1",
          artifacts: [
            { run_id: "run-1", kind: "react_summary", payload: { answer: "ok" } },
          ],
        }),
        { status: 200 },
      ),
    );

    const req = new Request("http://localhost/api/ops/runs/run-1/artifacts");
    const res = await GET(req, { params: Promise.resolve({ runId: "run-1" }) });
    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith(
      "/api/py/ops/runs/run-1/artifacts",
      { method: "GET" },
      req,
    );
  });

  it("404/5xx 由 forwardOpsRequest 原样返回，供组件静默降级", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(JSON.stringify({ ok: false, error: "Not found" }), { status: 404 }),
    );

    const res = await GET(
      new Request("http://localhost/api/ops/runs/run-missing/artifacts"),
      { params: Promise.resolve({ runId: "run-missing" }) },
    );
    expect(res.status).toBe(404);
  });

  it("runId 被 URL 编码", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(JSON.stringify({ run_id: "run+special", artifacts: [] }), { status: 200 }),
    );

    await GET(
      new Request("http://localhost/api/ops/runs/run+special/artifacts"),
      { params: Promise.resolve({ runId: "run+special" }) },
    );
    expect(forwardOpsRequest).toHaveBeenCalledWith(
      "/api/py/ops/runs/run%2Bspecial/artifacts",
      { method: "GET" },
      expect.any(Request),
    );
  });
});
