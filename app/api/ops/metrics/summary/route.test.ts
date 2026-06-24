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

describe("GET /api/ops/metrics/summary", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("未授权时返回门闸响应", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(
      Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );

    const res = await GET(new Request("http://localhost/api/ops/metrics/summary?days=7"));
    expect(res.status).toBe(401);
    expect(forwardOpsRequest).not.toHaveBeenCalled();
  });

  it("默认 days=7 转发 upstream", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(JSON.stringify({ window_days: 7, total_runs: 0 }), { status: 200 }),
    );

    const res = await GET(new Request("http://localhost/api/ops/metrics/summary"));
    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith("/api/py/ops/metrics/summary?days=7", {
      method: "GET",
    });
  });

  it("非法 days 回退 7", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(new Response("{}", { status: 200 }));

    await GET(new Request("http://localhost/api/ops/metrics/summary?days=abc"));
    expect(forwardOpsRequest).toHaveBeenCalledWith("/api/py/ops/metrics/summary?days=7", {
      method: "GET",
    });
  });

  it("合法 days 透传", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(new Response("{}", { status: 200 }));

    await GET(new Request("http://localhost/api/ops/metrics/summary?days=30"));
    expect(forwardOpsRequest).toHaveBeenCalledWith("/api/py/ops/metrics/summary?days=30", {
      method: "GET",
    });
  });
});
