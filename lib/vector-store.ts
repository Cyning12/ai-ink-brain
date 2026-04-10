import { embedTexts } from "@/lib/siliconflow";
import { createSupabaseServerClient } from "@/lib/supabase";

export type RetrievedChunk = {
  id: number;
  content: string;
  metadata: Record<string, unknown>;
  /** 与 pgvector cosine distance 对应的相似度近似（1 - distance），具体见 SQL */
  similarity: number;
};

type MatchDocumentsRow = {
  id: number;
  content: string;
  metadata: Record<string, unknown> | null;
  similarity: number;
};

/**
 * 语义检索：依赖 Supabase RPC `match_documents`（见 supabase/sql/match_documents.sql）。
 * 查询侧：先对用户问题做 Dense Embedding，再 Cosine Distance Top-k。
 */
export async function searchSimilarChunks(
  query: string,
  opts?: { topK?: number },
): Promise<RetrievedChunk[]> {
  const topK = opts?.topK ?? 5;
  const [queryEmbedding] = await embedTexts([query]);
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: topK,
  });

  if (error) {
    throw new Error(`match_documents failed: ${error.message}`);
  }

  const rows = (data ?? []) as MatchDocumentsRow[];
  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    similarity: r.similarity,
  }));
}
