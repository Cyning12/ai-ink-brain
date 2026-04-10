import fs from "node:fs";
import path from "node:path";

import { chunkTextByChars } from "@/lib/text/chunk";

export type IngestMetadata = {
  /** 子目录分类：content/<category>/... */
  category: string;
  /** 文件名去扩展名：xxx.md(x) -> xxx */
  slug: string;
  /** 文件最后修改时间（ISO 字符串） */
  lastModified: string;
  /** 相对 content 的路径，便于回溯来源 */
  relativePath: string;
  /** 分块索引（从 0 开始） */
  chunk_index: number;
};

export type IngestChunk = {
  content: string;
  /** 预留：向量生成后填充 */
  embedding: number[] | null;
  metadata: IngestMetadata;
};

type MarkdownFileInfo = {
  absolutePath: string;
  relativePathFromContent: string;
};

function isMarkdownFile(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return ext === ".md" || ext === ".mdx";
}

function ensureDirExists(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function walkDirRecursive(
  rootDir: string,
  currentDir: string,
  out: MarkdownFileInfo[],
) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  for (const ent of entries) {
    // 跳过隐藏文件夹（如 .DS_Store 所在）与常见无关目录
    if (ent.name.startsWith(".")) continue;
    if (ent.isDirectory() && (ent.name === "node_modules" || ent.name === ".next"))
      continue;

    const abs = path.join(currentDir, ent.name);
    if (ent.isDirectory()) {
      walkDirRecursive(rootDir, abs, out);
      continue;
    }

    if (!ent.isFile()) continue;
    if (!isMarkdownFile(ent.name)) continue;

    out.push({
      absolutePath: abs,
      relativePathFromContent: path.relative(rootDir, abs),
    });
  }
}

/**
 * 递归读取 content/ 及其子目录下所有 .md/.mdx。
 *
 * 输出：分块后的对象数组，每项包含：
 * - content: 分块内容
 * - embedding: null（待生成）
 * - metadata: category / slug / lastModified / relativePath / chunk_index
 */
export function getAllMarkdownFiles(): IngestChunk[] {
  const contentRoot = path.join(process.cwd(), "content");
  ensureDirExists(contentRoot);

  const files: MarkdownFileInfo[] = [];
  walkDirRecursive(contentRoot, contentRoot, files);

  const results: IngestChunk[] = [];

  for (const f of files) {
    const stat = fs.statSync(f.absolutePath);
    const lastModified = new Date(stat.mtimeMs).toISOString();

    const rel = f.relativePathFromContent.split(path.sep).join("/");
    const [category] = rel.split("/");
    const base = path.basename(f.absolutePath);
    const slug = base.replace(/\.(md|mdx)$/i, "");

    const raw = fs.readFileSync(f.absolutePath, "utf-8");
    const chunks = chunkTextByChars(raw, { chunkSize: 512, overlap: 50 });

    for (const c of chunks) {
      results.push({
        content: c.content,
        embedding: null,
        metadata: {
          category: category || "uncategorized",
          slug,
          lastModified,
          relativePath: rel,
          chunk_index: c.chunk_index,
        },
      });
    }
  }

  return results;
}

