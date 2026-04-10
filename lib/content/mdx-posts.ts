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
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
};

function assertDir() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
}

export function getAllSlugs(): string[] {
  assertDir();
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getPostBySlug(slug: string): MdxPost | null {
  assertDir();
  const full = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;

  const raw = fs.readFileSync(full, "utf-8");
  const parsed = matter(raw);
  const fm = parsed.data as Partial<PostFrontmatter>;

  if (!fm.title || typeof fm.title !== "string") {
    throw new Error(`Invalid frontmatter: missing title for slug "${slug}"`);
  }

  return {
    slug,
    frontmatter: {
      title: fm.title,
      date: typeof fm.date === "string" ? fm.date : undefined,
      description:
        typeof fm.description === "string" ? fm.description : undefined,
    },
    content: parsed.content,
  };
}

export function getAllPostsMeta(): Array<{ slug: string } & PostFrontmatter> {
  return getAllSlugs()
    .map((slug) => {
      const post = getPostBySlug(slug);
      if (!post) return null;
      return { slug, ...post.frontmatter };
    })
    .filter((x): x is { slug: string } & PostFrontmatter => x !== null)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}
