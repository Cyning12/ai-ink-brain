import { getOpsDeskAuthMode, getOpsDeskSecret } from "@/lib/auth/ops-env";
import {
  lookupOpsDeskSession,
  type ParsedOpsDeskSession,
} from "@/lib/auth/ops-session";

export const runtime = "nodejs";

export type OpsSessionPayload = {
  ok: boolean;
  role?: "viewer" | "maintainer";
  configured?: boolean;
  expiresAt?: string;
  error?: string;
};

export async function GET(request: Request): Promise<Response> {
  if (getOpsDeskAuthMode() === "db") {
    const lookup = await lookupOpsDeskSession(request, "");
    if (lookup.status === "unavailable") {
      return Response.json(
        { ok: false, error: "鉴权服务暂不可用，请稍后重试" },
        { status: 503 },
      );
    }
    if (lookup.status !== "authenticated") {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const session = lookup.session;
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

  const secret = getOpsDeskSecret();
  if (!secret) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量：OPS_DESK_SECRET" },
      { status: 503 },
    );
  }

  const lookup = await lookupOpsDeskSession(request, secret);
  if (lookup.status === "unauthenticated") {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (lookup.status === "unavailable") {
    return Response.json(
      { ok: false, error: "鉴权服务暂不可用，请稍后重试" },
      { status: 503 },
    );
  }

  const session: ParsedOpsDeskSession = lookup.session;
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
