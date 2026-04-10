import { requireAdminApiSecret } from "@/lib/auth";
import type { ChatMessage } from "@/lib/types/chat";
import { searchSimilarChunks } from "@/lib/vector-store";

export const runtime = "nodejs";

type ChatRequestBody = {
  messages?: ChatMessage[];
  /** 为 true 时先做 Top-k 向量检索，再把片段拼进占位回复（后续可接流式 LLM） */
  useRag?: boolean;
};

function lastUserMessage(messages: ChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (m && m.role === "user" && m.content.trim()) return m.content.trim();
  }
  return null;
}

/**
 * AI 聊天核心接口：需 Bearer NEXT_PUBLIC_ADMIN_SECRET（或兼容 CHAT_API_SECRET）。
 * 浏览器端不要硬编码密钥；请通过 Server Action 在服务端代发（见 app/chat/actions.ts）。
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminApiSecret(request);
  if (denied) return denied;

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  const query = lastUserMessage(messages);

  let ragSnippets: string[] = [];
  if (body.useRag && query) {
    try {
      const hits = await searchSimilarChunks(query, { topK: 5 });
      ragSnippets = hits.map((h) => h.content);
    } catch {
      // 未创建 RPC 或表未就绪时，占位回复仍返回，避免整接口 500
      ragSnippets = [];
    }
  }

  const ragBlock =
    ragSnippets.length > 0
      ? `【RAG 检索片段（Top-k）】\n${ragSnippets.join("\n---\n").slice(0, 4000)}`
      : "";

  const content = [
    ragBlock,
    "",
    "（占位：后续在此接入 SiliconFlow 对话模型与 Vercel AI SDK streamText。）",
  ]
    .filter(Boolean)
    .join("\n");

  return Response.json({
    ok: true,
    message: { role: "assistant" as const, content },
  });
}
