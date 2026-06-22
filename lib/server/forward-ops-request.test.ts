import { describe, expect, it, vi, afterEach } from "vitest";

import { forwardOpsRequest } from "@/lib/server/forward-ops-request";

describe("forwardOpsRequest", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("未配置 OPS_DESK_SECRET 时返回 503", async () => {
    vi.stubEnv("OPS_DESK_SECRET", "");
    vi.stubEnv("PY_API_URL", "http://py.local");
    const res = await forwardOpsRequest("/ops/chat/messages", { method: "POST", body: "{}" });
    expect(res.status).toBe(503);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.ok).toBe(false);
    expect(String(data.error)).toContain("OPS_DESK_SECRET");
  });

  it("转发时注入 x-ops-secret 头", async () => {
    vi.stubEnv("OPS_DESK_SECRET", "ops-secret-123");
    vi.stubEnv("PY_API_URL", "http://py.local");

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ run_id: "run-1" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await forwardOpsRequest("/ops/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "hi" }),
    });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get("x-ops-secret")).toBe("ops-secret-123");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("Python 不可达时返回结构化 503", async () => {
    vi.stubEnv("OPS_DESK_SECRET", "ops-secret-123");
    vi.stubEnv("PY_API_URL", "http://py.local");

    const fetchMock = vi.fn().mockRejectedValue(new Error("connect refused"));
    vi.stubGlobal("fetch", fetchMock);

    const res = await forwardOpsRequest("/ops/runs/run-1", { method: "GET" });
    expect(res.status).toBe(503);
    const data = (await res.json()) as Record<string, unknown>;
    expect(data.ok).toBe(false);
    expect(String(data.error)).toContain("无法连接");
  });
});
