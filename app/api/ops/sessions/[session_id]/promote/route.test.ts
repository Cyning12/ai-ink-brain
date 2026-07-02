vi.mock("@/lib/auth/ops-session", () => ({
  requireOpsDeskAccess: vi.fn(),
}));

vi.mock("@/lib/server/forward-ops-request", () => ({
  forwardOpsRequest: vi.fn(),
}));

import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireOpsDeskAccess } from "@/lib/auth/ops-session";
import { forwardOpsRequest } from "@/lib/server/forward-ops-request";
import { GET } from "./preview/route";
import { POST } from "./route";

describe("/api/ops/sessions/[session_id]/promote", () => {
  beforeEach(() => {
    vi.mocked(requireOpsDeskAccess).mockReset();
    vi.mocked(forwardOpsRequest).mockReset();
  });

  it("GET preview 未授权 401", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(
      Response.json({ ok: false }, { status: 401 }),
    );
    const res = await GET(
      new Request(
        "http://localhost/api/ops/sessions/sess_test/promote/preview?target_repo=ai-ink-brain-api-python",
      ),
      { params: Promise.resolve({ session_id: "sess_test" }) },
    );
    expect(res.status).toBe(401);
  });

  it("GET preview 转发", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(new Response("{}", { status: 200 }));
    const req = new Request(
      "http://localhost/api/ops/sessions/sess_test/promote/preview?target_repo=ai-ink-brain-api-python",
    );
    const res = await GET(req, { params: Promise.resolve({ session_id: "sess_test" }) });
    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith(
      expect.stringContaining("/api/py/ops/sessions/sess_test/promote/preview"),
      expect.objectContaining({ method: "GET" }),
      req,
    );
  });

  it("POST promote 转发", async () => {
    vi.mocked(requireOpsDeskAccess).mockResolvedValue(null);
    vi.mocked(forwardOpsRequest).mockResolvedValue(new Response("{}", { status: 200 }));
    const req = new Request("http://localhost/api/ops/sessions/sess_test/promote", {
      method: "POST",
      body: JSON.stringify({ target_repo: "ai-ink-brain-api-python", confirm: true }),
    });
    const res = await POST(req, { params: Promise.resolve({ session_id: "sess_test" }) });
    expect(res.status).toBe(200);
    expect(forwardOpsRequest).toHaveBeenCalledWith(
      "/api/py/ops/sessions/sess_test/promote",
      expect.objectContaining({ method: "POST" }),
      req,
    );
  });
});
