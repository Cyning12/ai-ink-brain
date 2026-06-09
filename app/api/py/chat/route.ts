import { requireAdminApiSecret } from "@/lib/auth";
import { forwardPyRagChat } from "@/lib/server/forward-py-rag-chat";

export const runtime = "nodejs";

/**
 * BFF：将 /api/py/chat 显式转发到 FastAPI，避免仅依赖 rewrites 时连接失败只显示笼统 500。
 * 与 rewrites 并存时，本路由优先匹配 /api/py/chat。
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;
  return forwardPyRagChat(request);
}
