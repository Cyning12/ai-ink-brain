import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/ops-session", () => ({
  requireOpsDeskAccess: vi.fn(),
}));

vi.mock("@/lib/server/forward-ops-request", () => ({
  forwardOpsRequest: vi.fn(),
}));

import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";
import { GET, POST } from "./route";

describe("/api/ops/sessions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("GET 未授权时返回门闸响应", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(
      Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );

    const res = await GET(new Request("http://localhost/api/ops/sessions"));
    expect(res.status).toBe(401);
    expect(forwardOpsRequest).not.toHaveBeenCalled();
  });

  it("GET 授权后转发 upstream", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(JSON.stringify({ items: [], total: 0, limit: 50, offset: 0 }), { status: 200 }),
    );

    const req = new Request("http://localhost/api/ops/sessions?limit=10");
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith("/api/py/ops/sessions?limit=10", { method: "GET" }, req);
  });

  it("POST 授权后转发创建 session", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(JSON.stringify({ session_id: "sess_test" }), { status: 200 }),
    );

    const req = new Request("http://localhost/api/ops/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "demo", title: "Demo" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith(
      "/api/py/ops/sessions",
      expect.objectContaining({ method: "POST" }),
      req,
    );
  });
});
