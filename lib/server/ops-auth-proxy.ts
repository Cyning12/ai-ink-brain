import { fetchPyApiRaw } from "@/lib/py-service-proxy";

export type OpsSessionRemoteResult =
  | { ok: true; role: "viewer" | "maintainer"; expiresAt?: number }
  | { ok: false; reason: "unauthorized" | "unavailable" };

/** DB 模式：向 Python 校验 session；区分「未登录」与「鉴权服务不可用」。 */
export async function fetchOpsSessionFromPython(
  sessionId: string,
): Promise<OpsSessionRemoteResult> {
  try {
    const res = await fetchPyApiRaw("/api/py/ops/auth/session", {
      method: "GET",
      headers: { "x-ops-session": sessionId },
    });
    if (res.status === 401) {
      return { ok: false, reason: "unauthorized" };
    }
    if (!res.ok) {
      return { ok: false, reason: "unavailable" };
    }
    const body = (await res.json()) as {
      ok?: boolean;
      role?: "viewer" | "maintainer";
      expires_at?: string;
    };
    if (!body.ok || !body.role) {
      return { ok: false, reason: "unauthorized" };
    }
    return {
      ok: true,
      role: body.role,
      expiresAt: body.expires_at
        ? new Date(body.expires_at).getTime()
        : undefined,
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
