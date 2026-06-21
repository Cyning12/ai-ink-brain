import { getOpsDeskSecret } from "@/lib/auth/ops-env";
import { getOpsDeskSessionFromRequest } from "@/lib/auth/ops-session";

export const runtime = "nodejs";

export type OpsSessionPayload = {
  ok: boolean;
  role?: "viewer" | "maintainer";
  configured?: boolean;
  expiresAt?: string;
};

export async function GET(request: Request): Promise<Response> {
  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量：OPS_DESK_SECRET" },
      { status: 503 },
    );
  }

  const session = await getOpsDeskSessionFromRequest(request, secret);
  if (!session) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload: OpsSessionPayload = {
    ok: true,
    role: session.role,
    configured: true,
    expiresAt:
      session.expiresAt === undefined
        ? undefined
        : new Date(session.expiresAt).toISOString(),
  };
  return Response.json(payload);
}
