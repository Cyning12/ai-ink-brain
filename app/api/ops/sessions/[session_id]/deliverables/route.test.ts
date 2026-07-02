vi.mock("@/lib/auth/ops-session", () => ({
  requireOpsDeskAccess: vi.fn(),
}));

vi.mock("@/lib/server/forward-ops-request", () => ({
  forwardOpsRequest: vi.fn(),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";
import { GET } from "./route";

describe("/api/ops/sessions/[session_id]/deliverables", () => {
  beforeEach(() => {
    vi.mocked(requireOpsDeskAccess).mockReset();
    vi.mocked(forwardOpsRequest).mockReset();
  });

  it("未授权返回 401", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(
      Response.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );

    const res = await GET(
      new Request("http://localhost/api/ops/sessions/sess_test/deliverables"),
      { params: Promise.resolve({ session_id: "sess_test" }) },
    );

    expect(res.status).toBe(401);
  });

  it("GET 转发 deliverables", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(
      new Response(JSON.stringify({ session_id: "sess_test", items: [] }), { status: 200 }),
    );

    const req = new Request("http://localhost/api/ops/sessions/sess_test/deliverables");
    const res = await GET(req, { params: Promise.resolve({ session_id: "sess_test" }) });

    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith(
      "/api/py/ops/sessions/sess_test/deliverables",
      expect.objectContaining({ method: "GET" }),
      req,
    );
  });
});
