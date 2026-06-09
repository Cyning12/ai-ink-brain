import {
  forwardToPyApiAsTextResponse,
  resolveChatbiVerifyAuthorization,
} from "@/lib/py-service-proxy";

export const runtime = "nodejs";

/**
 * BFF：转发 Python GET /api/py/chatbi/access/verify。
 * 仅将浏览器凭据交给 Python 校验：优先 `Authorization: Bearer <明文>`，否则 `X-ChatBI-Access-Token`。
 * 本层不校验 NEXT_PUBLIC_ADMIN_SECRET。
 */
export async function GET(request: Request): Promise<Response> {
  const authorization = resolveChatbiVerifyAuthorization(request);
  if (!authorization) {
    return Response.json(
      {
        ok: false,
        error: "缺少访问令牌：请使用 Authorization: Bearer <明文> 或 X-ChatBI-Access-Token",
      },
      { status: 400 },
    );
  }

  return forwardToPyApiAsTextResponse(
    "/api/py/chatbi/access/verify",
    {
      method: "GET",
      headers: { Accept: "application/json", Authorization: authorization },
    },
    { serviceLabel: "ChatBI 校验" },
  );
}
