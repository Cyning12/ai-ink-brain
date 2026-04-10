import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

import { requireAdminApiSecret } from "@/lib/auth";
import { getEmbedding } from "@/lib/siliconflow";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/types/chat";

export const runtime = "nodejs";

type ChatRequestBody = {
  // 来自 AI SDK DefaultChatTransport 的 UIMessage（字段可能是 content 或 parts）
  messages?: Array<ChatMessage & { parts?: unknown[] }>;
};

function messageToText(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const m = message as { content?: unknown; parts?: unknown[] };
  if (typeof m.content === "string") return m.content;
  if (Array.isArray(m.parts)) {
    return m.parts
      .map((p) => {
        if (!p || typeof p !== "object") return "";
        const part = p as { type?: unknown; text?: unknown };
        return part.type === "text" && typeof part.text === "string"
          ? part.text
          : "";
      })
      .join("");
  }
  return "";
}

function lastUserMessage(messages: Array<ChatMessage & { parts?: unknown[] }>): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (!m || m.role !== "user") continue;
    const text = messageToText(m).trim();
    if (text) return text;
  }
  return null;
}

/**
 * AI 聊天核心接口（RAG + 流式输出）：
 * - 权限：Authorization: Bearer <token>（token = NEXT_PUBLIC_ADMIN_SECRET / CHAT_API_SECRET）
 * - RAG：问题向量化 → Supabase RPC match_documents Top-k → 拼接上下文
 * - LLM：SiliconFlow（OpenAI 兼容）对话接口 + Vercel AI SDK streamText
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
  if (!query) {
    return Response.json({ ok: false, error: "Missing user message" }, { status: 400 });
  }

  const topK = 5;
  const matchThresholdRaw = process.env.RAG_MATCH_THRESHOLD?.trim();
  const matchThreshold =
    matchThresholdRaw && Number.isFinite(Number(matchThresholdRaw))
      ? Number(matchThresholdRaw)
      : null;

  type MatchDocumentsRow = {
    id: number;
    content: string;
    metadata: Record<string, unknown> | null;
    similarity: number;
  };

  let hits: MatchDocumentsRow[] = [];
  try {
    const queryEmbedding = await getEmbedding(query);
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_count: topK,
      match_threshold: matchThreshold,
    });
    if (error) throw new Error(error.message);
    hits = ((data ?? []) as MatchDocumentsRow[]).slice(0, topK);

    if (process.env.NODE_ENV === "development") {
      const scores = hits.map((h) => Number(h.similarity.toFixed(4)));
      console.log(`[rag] topK=${topK} scores=${JSON.stringify(scores)}`);
    }
  } catch (err) {
    // RPC/表未就绪时：降级为无上下文回答，避免接口 500
    if (process.env.NODE_ENV === "development") {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.log(`[rag] disabled: ${message}`);
    }
    hits = [];
  }

  const context = hits
    .map((h, i) => {
      const meta = h.metadata ?? {};
      const slug = typeof meta.slug === "string" ? meta.slug : "";
      const category = typeof meta.category === "string" ? meta.category : "";
      const head = [slug && `slug=${slug}`, category && `category=${category}`]
        .filter(Boolean)
        .join(" ");
      return `[#${i + 1}${head ? ` ${head}` : ""}]\n${h.content}`;
    })
    .join("\n\n---\n\n")
    .slice(0, 6000);

  const system = `你是一个名为 Cyning 的 AI 助手。请基于以下提供的【上下文】回答问题。如果上下文不足以回答，请告知用户。\n\n上下文：\n${context || "（无）"}`;

  const apiKey = process.env.SILICONFLOW_API_KEY?.trim();
  if (!apiKey) {
    return Response.json(
      { ok: false, error: "Missing required env: SILICONFLOW_API_KEY" },
      { status: 500 },
    );
  }

  const client = createOpenAI({
    apiKey,
    baseURL: process.env.SILICONFLOW_BASE_URL?.trim() || "https://api.siliconflow.cn/v1",
  });

  const modelId = process.env.SILICONFLOW_CHAT_MODEL?.trim() || "deepseek-ai/DeepSeek-V3";

  const result = streamText({
    // SiliconFlow 兼容 Chat Completions（/v1/chat/completions），不支持 OpenAI Responses（/v1/responses）
    model: client.chat(modelId),
    messages: [
      { role: "system", content: system },
      ...messages
        .map((m) => ({
          role: m.role,
          content: messageToText(m),
        }))
        .filter((m) => m.content.trim().length > 0),
    ],
    temperature: 0.2,
  });

  // 前端 DefaultChatTransport 期望 UIMessage JSON event stream
  return result.toUIMessageStreamResponse();
}
