/**
 * 简单 Bearer 校验：用于管理员入库、内部 Chat API 等场景。
 * 生产环境建议逐步替换为 Session / JWT（Supabase Auth 等）。
 */
export function requireBearerSecret(
  request: Request,
  envKey: string,
): Response | null {
  const expected = process.env[envKey];
  if (!expected) {
    return Response.json(
      { ok: false, error: `服务端未配置环境变量：${envKey}` },
      { status: 500 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
