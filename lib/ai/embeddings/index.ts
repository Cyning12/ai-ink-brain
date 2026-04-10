import { embedTextsDashScope } from "@/lib/ai/embeddings/dashscope-provider";
import { embedTextsSiliconFlow } from "@/lib/ai/embeddings/siliconflow-provider";

export { getExpectedEmbeddingDimension } from "@/lib/ai/embeddings/dimension";

export type EmbeddingProviderId = "siliconflow" | "dashscope" | "bailian";

function normalizeProvider(): EmbeddingProviderId {
  const raw = (process.env.EMBEDDING_PROVIDER ?? "siliconflow").trim().toLowerCase();
  if (raw === "dashscope" || raw === "bailian") return "dashscope";
  if (raw === "siliconflow") return "siliconflow";
  throw new Error(
    `未知的 EMBEDDING_PROVIDER「${raw}」。请使用 siliconflow | dashscope | bailian（bailian 与 dashscope 等价）。`,
  );
}

/**
 * 统一向量入口：入库与 RAG 检索均通过此函数，避免业务层绑定单一厂商。
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const p = normalizeProvider();
  if (p === "dashscope") {
    return embedTextsDashScope(texts);
  }
  return embedTextsSiliconFlow(texts);
}
