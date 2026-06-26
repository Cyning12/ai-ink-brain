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

describe("GET /api/ops/chat/models", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("未授权时返回门闸响应", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(
      Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );

    const res = await GET(new Request("http://localhost/api/ops/chat/models"));
    expect(res.status).toBe(401);
    expect(forwardOpsRequest).not.toHaveBeenCalled();
  });

  it("授权后转发 upstream GET /ops/chat/models", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(
        JSON.stringify({
          provider: "siliconflow",
          models: [],
          default_model: "deepseek-ai/DeepSeek-V4-Pro",
          auto_fallback: false,
        }),
        { status: 200 },
      ),
    );

    const req = new Request("http://localhost/api/ops/chat/models");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith("/api/py/ops/chat/models", { method: "GET" }, req);
  });
});
