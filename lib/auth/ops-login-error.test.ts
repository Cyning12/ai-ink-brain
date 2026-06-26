import { describe, expect, it } from "vitest";

import { mapOpsDbLoginError } from "@/lib/auth/ops-login-error";

describe("mapOpsDbLoginError", () => {
  it("maps invite expired", () => {
    expect(mapOpsDbLoginError({ code: "INVITE_EXPIRED" })).toBe("秘钥已过期");
  });

  it("maps invite invalid", () => {
    expect(mapOpsDbLoginError({ code: "INVITE_INVALID" })).toBe("秘钥无效");
  });

  it("fallback", () => {
    expect(mapOpsDbLoginError(null)).toBe("登录失败");
  });
});
