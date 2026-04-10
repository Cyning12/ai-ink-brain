import path from "node:path";

import {
  embedTexts,
  getExpectedEmbeddingDimension,
} from "@/lib/siliconflow";
import { getEmbedding } from "@/lib/siliconflow";
import { getAllMarkdownFiles, type IngestChunk } from "@/lib/ingest-utils";
import { createSupabaseServerClient } from "@/lib/supabase";
/** 单次 Embedding 请求条数上限（避免 payload 过大） */
const EMBED_BATCH_SIZE = 32;
/** 单次 insert 行数 */
const INSERT_BATCH_SIZE = 80;

export type ProcessMarkdownResult = {
  filesScanned: number;
  chunksTotal: number;
  chunksInserted: number;
  rowsDeleted: number;
};

export type SyncContentToVectorResult = {
  filesScanned: number;
  chunksTotal: number;
  chunksUpserted: number;
  rowsDeleted: number;
};

function toDbMetadata(chunk: IngestChunk): Record<string, unknown> {
  const m = chunk.metadata;
  const filename = path.posix.basename(m.relativePath.replace(/\\/g, "/"));
  return {
    category: m.category,
    slug: m.slug,
    mtime: m.lastModified,
    lastModified: m.lastModified,
    relativePath: m.relativePath,
    chunk_index: m.chunk_index,
    filename,
    original_link: null,
    page_number: null,
    section_header: null,
  };
}

function buildEnhancedChunkText(chunk: IngestChunk): string {
  const m = chunk.metadata;
  const fileName = path.posix.basename(m.relativePath.replace(/\\/g, "/"));
  const mtime = m.lastModified;
  const category = m.category;
  const chunkContent = chunk.content;

  return [
    "[Document Context]",
    `Title: ${fileName}`,
    `Date: ${mtime}`,
    `Category: ${category}`,
    "---",
    `Content: ${chunkContent}`,
  ].join("\n");
}

function logIngestFiles(uniquePaths: string[]) {
  if (process.env.NODE_ENV !== "development") return;
  console.log(`[ingest] Files to process: ${uniquePaths.length}`);
  uniquePaths.forEach((p) => console.log(`[ingest] file: ${p}`));
}

function assertEmbeddingDim(vec: number[], index: number) {
  const expected = getExpectedEmbeddingDimension();
  if (vec.length !== expected) {
    throw new Error(
      `Embedding 维度为 ${vec.length}，与期望 ${expected}（EMBEDDING_DIM / SILICONFLOW_EMBEDDING_DIM 与 supabase vector(N)）不一致。分块索引：${index}`,
    );
  }
}

/** PostgREST / pgvector 接受的字面量形式 */
function toPgVectorLiteral(vec: number[]): string {
  return `[${vec.join(",")}]`;
}

function formatSupabaseError(prefix: string, err: { message: string }): string {
  const msg = err.message;
  let out = `${prefix}: ${msg}`;
  if (/invalid api key|jwt expired|jwt/i.test(msg)) {
    out +=
      "（此为 Supabase 鉴权失败，与 SiliconFlow 无关。请核对：① NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_URL 与 ② SUPABASE_SERVICE_ROLE_KEY 必须来自**同一项目**的 Settings → API；密钥须为 service_role，勿用 anon；③ 若存在 .env.local，会覆盖 .env，请两处都检查；④ 勿在密钥前多加 Bearer、引号或断行。）";
  }
  if (/schema cache|could not find the table.*documents/i.test(msg)) {
    out +=
      "（当前项目尚未创建 public.documents，或 PostgREST 尚未刷新。请在 Supabase Dashboard → SQL Editor 执行仓库内 supabase/sql/init.sql 全文，等待约 1 分钟后重试 ingest；确认连接的是已执行过该脚本的项目。）";
  }
  return out;
}

async function deleteDocumentsByRelativePaths(
  relativePaths: string[],
): Promise<number> {
  const supabase = createSupabaseServerClient();
  let deleted = 0;
  for (const rel of relativePaths) {
    const { data: rows, error: selErr } = await supabase
      .from("documents")
      .select("id")
      .filter("metadata->>relativePath", "eq", rel);
    if (selErr) {
      throw new Error(
        formatSupabaseError(`查询待删除分块失败 (${rel})`, selErr),
      );
    }
    const ids = (rows ?? []).map((r: { id: number }) => r.id);
    if (ids.length === 0) continue;
    const { error: delErr } = await supabase.from("documents").delete().in("id", ids);
    if (delErr) {
      throw new Error(
        formatSupabaseError(`删除旧分块失败 (${rel})`, delErr),
      );
    }
    deleted += ids.length;
  }
  return deleted;
}

/**
 * 递归处理 content/ 下全部 .md/.mdx：512/50 分块 → embedTexts（SiliconFlow 或百炼）→ 写入 Supabase documents。
 * 同一 relativePath 会先删库内旧行再插入，便于重复执行同步。
 */
export async function processMarkdownFiles(): Promise<ProcessMarkdownResult> {
  const chunks = getAllMarkdownFiles();
  const uniquePaths = [
    ...new Set(chunks.map((c) => c.metadata.relativePath)),
  ];
  const filesScanned = uniquePaths.length;

  if (chunks.length === 0) {
    return {
      filesScanned,
      chunksTotal: 0,
      chunksInserted: 0,
      rowsDeleted: 0,
    };
  }

  logIngestFiles(uniquePaths);

  const rowsDeleted = await deleteDocumentsByRelativePaths(uniquePaths);

  const supabase = createSupabaseServerClient();
  const embeddings: number[][] = [];

  for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
    const texts = batch.map((c) => buildEnhancedChunkText(c));
    const vectors = await embedTexts(texts);
    vectors.forEach((vec, j) => {
      assertEmbeddingDim(vec, i + j);
      embeddings.push(vec);
    });
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[ingest] Embedded ${Math.min(i + EMBED_BATCH_SIZE, chunks.length)}/${chunks.length} chunks`,
      );
    }
  }

  let inserted = 0;
  const rows = chunks.map((chunk, idx) => ({
    // 入库内容也注入上下文，确保检索命中时能直接带出文件名/日期等锚点
    content: buildEnhancedChunkText(chunk),
    metadata: toDbMetadata(chunk),
    embedding: toPgVectorLiteral(embeddings[idx]!),
  }));

  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    const slice = rows.slice(i, i + INSERT_BATCH_SIZE);
    const { error } = await supabase.from("documents").insert(slice);
    if (error) {
      throw new Error(formatSupabaseError("写入 documents 失败", error));
    }
    inserted += slice.length;
  }

  return {
    filesScanned,
    chunksTotal: chunks.length,
    chunksInserted: inserted,
    rowsDeleted,
  };
}

async function deleteDocumentsBySlugs(slugs: string[]): Promise<number> {
  const supabase = createSupabaseServerClient();
  let deleted = 0;
  for (const slug of slugs) {
    // 幂等入口：同一 slug 上传前先删库内旧分块
    const { error: delErr, count } = await supabase
      .from("documents")
      .delete({ count: "exact" })
      .eq("metadata->>slug", slug);
    if (delErr) {
      throw new Error(formatSupabaseError(`删除旧分块失败 (slug=${slug})`, delErr));
    }
    deleted += count ?? 0;
  }
  return deleted;
}

/**
 * 核心 RAG 注入：递归读取 content/ → 512/50 分块 → 每块调用 getEmbedding → 写入 Supabase documents。
 *
 * 安全策略：同一 slug 上传前先删除旧数据，避免重复入库。
 */
export async function syncContentToVector(): Promise<SyncContentToVectorResult> {
  const chunks = getAllMarkdownFiles();
  const uniquePaths = [
    ...new Set(chunks.map((c) => c.metadata.relativePath)),
  ];
  const filesScanned = uniquePaths.length;

  if (chunks.length === 0) {
    return {
      filesScanned,
      chunksTotal: 0,
      chunksUpserted: 0,
      rowsDeleted: 0,
    };
  }

  logIngestFiles(uniquePaths);

  const uniqueSlugs = [...new Set(chunks.map((c) => c.metadata.slug))];
  const rowsDeleted = await deleteDocumentsBySlugs(uniqueSlugs);

  const supabase = createSupabaseServerClient();

  const embeddings: number[][] = [];
  let lastRelPath = "";
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]!;
    if (process.env.NODE_ENV === "development") {
      if (chunk.metadata.relativePath !== lastRelPath) {
        lastRelPath = chunk.metadata.relativePath;
        console.log(`[ingest] Processing file: ${lastRelPath}`);
      }
    }
    const vec = await getEmbedding(buildEnhancedChunkText(chunk));
    assertEmbeddingDim(vec, i);
    embeddings.push(vec);
    if (process.env.NODE_ENV === "development" && (i + 1) % 25 === 0) {
      console.log(`[ingest] Embedded ${i + 1}/${chunks.length} chunks`);
    }
  }

  // 说明：public.documents 默认无唯一约束，DB 侧 upsert 需要 onConflict 目标；
  // 这里用“先删后插”实现幂等同步（语义等价于 upsert）。
  const rows = chunks.map((chunk, idx) => ({
    // 入库内容也注入上下文，确保检索命中时能直接带出文件名/日期等锚点
    content: buildEnhancedChunkText(chunk),
    metadata: toDbMetadata(chunk),
    embedding: toPgVectorLiteral(embeddings[idx]!),
  }));

  let inserted = 0;
  for (let i = 0; i < rows.length; i += INSERT_BATCH_SIZE) {
    const slice = rows.slice(i, i + INSERT_BATCH_SIZE);
    const { error } = await supabase.from("documents").insert(slice);
    if (error) {
      throw new Error(formatSupabaseError("写入 documents 失败", error));
    }
    inserted += slice.length;
  }

  return {
    filesScanned,
    chunksTotal: chunks.length,
    chunksUpserted: inserted,
    rowsDeleted,
  };
}
