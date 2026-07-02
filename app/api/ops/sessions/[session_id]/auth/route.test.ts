vi.mock("@/lib/auth/ops-session", () => ({
  requireOpsDeskAccess: vi.fn(),
}));

vi.mock("@/lib/server/forward-ops-request", () => ({
  forwardOpsRequest: vi.fn(),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";
import { POST } from "./route";

describe("/api/ops/sessions/[session_id]/auth", () => {
  beforeEach(() => {
    vi.mocked(requireOpsDeskAccess).mockReset();
    vi.mocked(forwardOpsRequest).mockReset();
  });

  it("未授权返回 401", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(
      Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );

    const res = await POST(
      new Request("http://localhost/api/ops/sessions/sess_test/auth", {
        method: "POST",
        body: JSON.stringify({ action: "approve" }),
      }),
      { params: Promise.resolve({ session_id: "sess_test" }) },
    );

    expect(res.status).toBe(401);
  });

  it("POST 授权后转发 auth", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(JSON.stringify({ status: "dispatched" }), { status: 200 }),
    );

    const req = new Request("http://localhost/api/ops/sessions/sess_test/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });

    const res = await POST(req, { params: Promise.resolve({ session_id: "sess_test" }) });

    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith(
      "/api/py/ops/sessions/sess_test/auth",
      expect.objectContaining({ method: "POST" }),
      req,
    );
  });
});
