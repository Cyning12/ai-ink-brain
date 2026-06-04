import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

/** Portfolio 公开展示 category；与 ingest 首段路径一致（SPEC §5）。 */
export const PORTFOLIO_CATEGORIES = ["methodology", "resume", "evidence"] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

export type PortfolioDoc = {
  category: PortfolioCategory;
  /** 相对 category 的文件名（无扩展名），如 vol3_ARTICLE_… */
  slug: string;
  fileName: string;
  title: string;
  description?: string;
  date?: string;
  content: string;
  ext: "md" | "mdx";
};

function isMarkdown(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return ext === ".md" || ext === ".mdx";
}

/** 解码路由段并统一 NFC（Next.js catch-all 可能仍带 % 编码）。 */
function decodeSlugPart(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment.replace(/\+/g, " "));
  } catch {
    decoded = segment;
  }
  return decoded.normalize("NFC");
}

export function normalizePortfolioSlugParts(
  slug: string | string[] | undefined,
): string[] {
  if (slug == null) return [];
  const arr = Array.isArray(slug) ? slug : [slug];
  return arr.filter((s) => s.length > 0).map(decodeSlugPart);
}

function slugPartsMatchDisk(requested: string[], diskSlug: string): boolean {
  const diskParts = diskSlug.split("/").filter(Boolean);
  if (diskParts.length !== requested.length) return false;
  return diskParts.every(
    (part, i) => part.normalize("NFC") === requested[i]!.normalize("NFC"),
  );
}

function categoryDir(category: PortfolioCategory): string {
  return path.join(CONTENT_DIR, category);
}

function parseDocFile(
  category: PortfolioCategory,
  absPath: string,
): PortfolioDoc | null {
  if (!fs.existsSync(absPath)) return null;
  const raw = fs.readFileSync(absPath, "utf-8");
  const ext: "md" | "mdx" = absPath.toLowerCase().endsWith(".mdx") ? "mdx" : "md";
  const fileName = path.basename(absPath);
  const slug = fileName.replace(/\.(md|mdx)$/i, "");
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  const title =
    typeof fm.title === "string" && fm.title.trim()
      ? fm.title.trim()
      : slug;

  return {
    category,
    slug,
    fileName,
    title,
    description:
      typeof fm.description === "string" ? fm.description : undefined,
    date: typeof fm.date === "string" ? fm.date : undefined,
    content: parsed.content,
    ext,
  };
}

/** 列出某 category 下全部 markdown（仅一级目录，不扫 tasks/harness 等）。 */
export function listPortfolioDocs(category: PortfolioCategory): PortfolioDoc[] {
  const dir = categoryDir(category);
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const docs: PortfolioDoc[] = [];

  for (const ent of entries) {
    if (!ent.isFile()) continue;
    if (ent.name.toLowerCase() === "readme.md") continue;
    if (!isMarkdown(ent.name)) continue;
    const doc = parseDocFile(category, path.join(dir, ent.name));
    if (doc) docs.push(doc);
  }

  return docs.sort((a, b) => {
    const byDate = (b.date ?? "").localeCompare(a.date ?? "");
    if (byDate !== 0) return byDate;
    return a.slug.localeCompare(b.slug);
  });
}

/** 按 slug（文件名无扩展名）读取单篇；slug 可含子路径段（未来扩展）。 */
export function getPortfolioDocBySlug(
  category: PortfolioCategory,
  slugParts: string[],
): PortfolioDoc | null {
  const normalized = slugParts.map(decodeSlugPart);
  if (normalized.length === 0) return null;

  const relNoExt = normalized.join("/");
  const dir = categoryDir(category);
  const mdx = path.join(dir, `${relNoExt}.mdx`);
  const md = path.join(dir, `${relNoExt}.md`);
  let abs: string | null = fs.existsSync(mdx) ? mdx : fs.existsSync(md) ? md : null;

  // 直接路径未命中时，按 list 结果做 NFC 对齐（缓解 URL 编码差异）
  if (!abs) {
    const matched = listPortfolioDocs(category).find((d) =>
      slugPartsMatchDisk(normalized, d.slug),
    );
    if (matched) {
      abs = path.join(dir, matched.fileName);
    }
  }

  if (!abs) return null;
  // 防止路径穿越 category 边界
  if (!abs.startsWith(dir + path.sep)) return null;
  return parseDocFile(category, abs);
}

/** 读取 category 首选文件；无文件时 missing=true（F1 降级）。 */
export function getPortfolioPreferredDoc(
  category: PortfolioCategory,
  preferredBaseName: string,
): { doc: PortfolioDoc | null; missing: boolean } {
  const docs = listPortfolioDocs(category);
  if (docs.length === 0) return { doc: null, missing: true };
  const preferred =
    docs.find((d) => d.slug === preferredBaseName) ?? docs[0]!;
  return { doc: preferred, missing: false };
}

export function getAllMethodologySlugParams(): { slug: string[] }[] {
  return listPortfolioDocs("methodology").map((d) => ({
    slug: d.slug.split("/").filter(Boolean),
  }));
}
