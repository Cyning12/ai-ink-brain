/**
 * 与 supabase/sql/init.sql 中 vector(N) 一致；换模型时同步改库表维度并全量重灌。
 * 优先 EMBEDDING_DIM，兼容旧名 SILICONFLOW_EMBEDDING_DIM。
 */
export function getExpectedEmbeddingDimension(): number {
  const raw =
    process.env.EMBEDDING_DIM?.trim() ||
    process.env.SILICONFLOW_EMBEDDING_DIM?.trim();
  if (!raw) return 1024;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return 1024;
  return n;
}
