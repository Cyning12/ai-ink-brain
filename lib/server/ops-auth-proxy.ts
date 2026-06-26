import { fetchPyApiRaw } from "@/lib/py-service-proxy";

/** DB 模式：向 Python 校验 session 并返回 role。 */
export async function fetchOpsSessionFromPython(
  sessionId: string,
): Promise<{ role: "viewer" | "maintainer"; expiresAt?: number } | null> {
  try {
    const res = await fetchPyApiRaw("/api/py/ops/auth/session", {
      method: "GET",
      headers: { "x-ops-session": sessionId },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      ok?: boolean;
      role?: "viewer" | "maintainer";
      expires_at?: string;
    };
    if (!body.ok || !body.role) return null;
    return {
      role: body.role,
      expiresAt: body.expires_at
        ? new Date(body.expires_at).getTime()
        : undefined,
    };
  } catch {
    return null;
  }
}
