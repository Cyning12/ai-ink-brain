import { describe, expect, it, vi, afterEach } from "vitest";

import {
  buildChatbiAuthHeaders,
  buildPyApiUrl,
  formatPyFetchErrorHint,
  getPyApiBaseUrl,
  isPyHeadersOverflowError,
  resolveChatbiVerifyAuthorization,
} from "@/lib/py-service-proxy";

describe("getPyApiBaseUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("默认去尾斜杠", () => {
    vi.stubEnv("PY_API_URL", undefined);
    expect(getPyApiBaseUrl()).toBe("http://127.0.0.1:8000");
  });

  it("去除 env 尾斜杠", () => {
    vi.stubEnv("PY_API_URL", "http://example.com:9000/");
    expect(getPyApiBaseUrl()).toBe("http://example.com:9000");
  });
});

describe("buildPyApiUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("拼接 path 与 query", () => {
    vi.stubEnv("PY_API_URL", "http://py.local");
    expect(buildPyApiUrl("/api/py/chat/history?session_id=abc")).toBe(
      "http://py.local/api/py/chat/history?session_id=abc",
    );
  });

  it("补前导斜杠", () => {
    vi.stubEnv("PY_API_URL", "http://py.local");
    expect(buildPyApiUrl("api/py/chat")).toBe("http://py.local/api/py/chat");
  });
});

describe("buildChatbiAuthHeaders", () => {
  it("X-ChatBI-Access-Token 优先转为 Authorization Bearer", () => {
    const req = new Request("http://localhost/api/py/unified/chat", {
      headers: {
        "x-chatbi-access-token": "plain-token-123",
        authorization: "Bearer old",
      },
    });
    const h = buildChatbiAuthHeaders(req);
    expect(h.Authorization).toBe("Bearer plain-token-123");
  });
});

describe("resolveChatbiVerifyAuthorization", () => {
  it("无 token 返回 null", () => {
    const req = new Request("http://localhost/api/py/chatbi/access/verify");
    expect(resolveChatbiVerifyAuthorization(req)).toBeNull();
  });

  it("x-chatbi-access-token 转为 Bearer", () => {
    const req = new Request("http://localhost/api/py/chatbi/access/verify", {
      headers: { "x-chatbi-access-token": "abc" },
    });
    expect(resolveChatbiVerifyAuthorization(req)).toBe("Bearer abc");
  });
});

describe("formatPyFetchErrorHint", () => {
  it("提取 UND_ERR_HEADERS_OVERFLOW cause code", () => {
    const err = new Error("fetch failed", {
      cause: { code: "UND_ERR_HEADERS_OVERFLOW" },
    });
    expect(isPyHeadersOverflowError(err)).toBe(true);
    expect(formatPyFetchErrorHint(err)).toContain("UND_ERR_HEADERS_OVERFLOW");
  });
});
