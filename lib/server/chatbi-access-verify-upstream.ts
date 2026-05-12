/**
 * 服务端直连 Python：校验 ChatBI 明文 Bearer（与 BFF GET /api/py/chatbi/access/verify 语义一致）。
 */

function pyBaseUrl(): string {
  return (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(/\/$/, "");
}

/** 上游校验成功返回 true；网络错误、非 200、或 body ok 非 true 返回 false */
export async function verifyChatbiPlainUpstream(plain: string): Promise<boolean> {
  const t = plain.replace(/^bearer\s+/i, "").trim();
  if (!t) return false;
  const url = `${pyBaseUrl()}/api/py/chatbi/access/verify`;
  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${t}` },
    });
  } catch {
    return false;
  }
  if (upstream.status !== 200) return false;
  try {
    const j = (await upstream.json()) as { ok?: unknown };
    return j?.ok === true;
  } catch {
    return false;
  }
}
