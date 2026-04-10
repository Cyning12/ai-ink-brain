-- 在 Supabase SQL Editor 中执行（启用 pgvector 后）。
-- 注意：vector(1024) 需与 SILICONFLOW_EMBEDDING_MODEL 输出维度一致。

create extension if not exists vector;

create or replace function public.match_documents(
  query_embedding vector(1024),
  match_count int default 5
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float8
)
language sql
stable
as $$
  select
    d.id,
    d.content,
    d.metadata,
    (1 - (d.embedding <=> query_embedding))::float8 as similarity
  from public.documents d
  order by d.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
