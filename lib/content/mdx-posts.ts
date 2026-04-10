import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type PostFrontmatter = {
  title: string;
  date?: string;
  description?: string;
};

export type MdxPost = {
  /** 例如：["learning","nextjs-guide"] 或 ["hello-world"] */
  slugParts: string[];
  /** 用于 URL 的 slug，如 "learning/nextjs-guide" */
  slug: string;
  /** 一级分类（content/<category>/...）；无分类时为 "uncategorized" */
  category: string;
  /** 文件扩展名（不带点）：md 或 mdx */
  ext: "md" | "mdx";
  frontmatter: PostFrontmatter;
  content: string;
};

function assertDir() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

function isMarkdownFile(name: string) {
  const ext = path.extname(name).toLowerCase();
  return ext === ".md" || ext === ".mdx";
}

function walkMarkdownFiles(
  rootDir: string,
  currentDir: string,
  out: string[],
) {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.name.startsWith(".")) continue;
    if (ent.isDirectory() && (ent.name === "node_modules" || ent.name === ".next"))
      continue;

    const abs = path.join(currentDir, ent.name);
    if (ent.isDirectory()) {
      walkMarkdownFiles(rootDir, abs, out);
      continue;
    }
    if (!ent.isFile()) continue;
    if (!isMarkdownFile(ent.name)) continue;

    // 统一为 posix 路径，方便 URL 拼接
    const rel = path.relative(rootDir, abs).split(path.sep).join("/");
    out.push(rel);
  }
}

export function getAllMarkdownRelativePaths(): string[] {
  assertDir();
  const out: string[] = [];
  walkMarkdownFiles(CONTENT_DIR, CONTENT_DIR, out);
  return out.sort();
}

export function getAllPostSlugParts(): string[][] {
  return getAllMarkdownRelativePaths().map((rel) => {
    const noExt = rel.replace(/\.(md|mdx)$/i, "");
    return noExt.split("/").filter(Boolean);
  });
}

/** 与磁盘上 readdir 得到的段一致地比较（缓解 NFC/NFD 等与 URL 解码不一致） */
function segmentMatchesUrl(a: string, b: string): boolean {
  return a.normalize("NFC") === b.normalize("NFC");
}

/**
 * 将请求路径段映射为 content 下真实相对路径段（找不到则 null）。
 */
function resolveSlugPartsOnDisk(requested: string[]): string[] | null {
  if (requested.length === 0) return null;
  for (const rel of getAllMarkdownRelativePaths()) {
    const noExt = rel.replace(/\.(md|mdx)$/i, "");
    const diskParts = noExt.split("/").filter(Boolean);
    if (diskParts.length !== requested.length) continue;
    if (diskParts.every((d, i) => segmentMatchesUrl(requested[i]!, d))) {
      return diskParts;
    }
  }
  return null;
}

function readPostFileBySlugParts(slugParts: string[]): {
  absPath: string;
  raw: string;
  ext: "md" | "mdx";
  resolvedParts: string[];
} | null {
  assertDir();
  const loadWithParts = (parts: string[]) => {
    const relNoExt = parts.join("/");
    const mdx = path.join(CONTENT_DIR, `${relNoExt}.mdx`);
    const md = path.join(CONTENT_DIR, `${relNoExt}.md`);
    const full = fs.existsSync(mdx) ? mdx : fs.existsSync(md) ? md : null;
    if (!full) return null;
    const raw = fs.readFileSync(full, "utf-8");
    const ext: "md" | "mdx" = full.toLowerCase().endsWith(".mdx")
      ? "mdx"
      : "md";
    return { absPath: full, raw, ext, resolvedParts: parts };
  };

  const direct = loadWithParts(slugParts);
  if (direct) return direct;
  const onDisk = resolveSlugPartsOnDisk(slugParts);
  if (!onDisk) return null;
  return loadWithParts(onDisk);
}

export function getPostBySlugParts(slugParts: string[]): MdxPost | null {
  const loaded = readPostFileBySlugParts(slugParts);
  if (!loaded) return null;

  const parsed = matter(loaded.raw);
  const fm = parsed.data as Partial<PostFrontmatter>;

  const parts = loaded.resolvedParts;
  const slug = parts.join("/");
  const category = parts[0] ?? "uncategorized";
  const title =
    typeof fm.title === "string" && fm.title.trim()
      ? fm.title.trim()
      : parts[parts.length - 1] ?? "Untitled";

  return {
    slugParts: parts,
    slug,
    category,
    ext: loaded.ext,
    frontmatter: {
      title,
      date: typeof fm.date === "string" ? fm.date : undefined,
      description:
        typeof fm.description === "string" ? fm.description : undefined,
    },
    content: parsed.content,
  };
}

export function getAllPostsMeta(): Array<
  { slug: string; category: string } & PostFrontmatter
> {
  return getAllPostSlugParts()
    .map((parts) => {
      const post = getPostBySlugParts(parts);
      if (!post) return null;
      return { slug: post.slug, category: post.category, ...post.frontmatter };
    })
    .filter(
      (x): x is { slug: string; category: string } & PostFrontmatter => x !== null,
    )
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
