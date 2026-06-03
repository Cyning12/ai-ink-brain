import { notFound } from "next/navigation";

import { BackButton } from "@/app/_components/back-button";
import { MarkdownContent } from "@/app/_components/markdown-content";
import { getAllPostSlugParts, getPostBySlugParts } from "@/lib/content/mdx-posts";

type PageProps = {
  params: Promise<{ slug: string | string[] | undefined }>;
};

/** 统一 catch-all 段为 string[]（兼容边缘形态） */
function normalizeSlugParam(slug: string | string[] | undefined): string[] {
  if (slug == null) return [];
  const arr = Array.isArray(slug) ? slug : [slug];
  return arr.filter((s) => s.length > 0);
}

export async function generateStaticParams() {
  return getAllPostSlugParts()
    // 学习日志：diary；学习资源：learning；任务：tasks；保留 legacy：content/*.mdx
    .filter(
      (parts) =>
        parts[0] === "diary" ||
        parts[0] === "learning" ||
        parts[0] === "tasks" ||
        parts.length === 1,
    )
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const slug = normalizeSlugParam((await params).slug);
  const post = getPostBySlugParts(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const slug = normalizeSlugParam((await params).slug);
  if (slug.length === 0) notFound();
  // Blog 仅展示学习日志（diary）、学习资源（learning）、任务（tasks）以及早期无分类文章（legacy：content/*.mdx）
  if (
    !(
      slug[0] === "diary" ||
      slug[0] === "learning" ||
      slug[0] === "tasks" ||
      slug.length === 1
    )
  )
    notFound();
  const post = getPostBySlugParts(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <BackButton />
      <p className="text-xs text-muted-foreground">
        {post.frontmatter.date ?? ""}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {post.frontmatter.title}
      </h1>
      {post.frontmatter.description ? (
        <p className="mt-4 text-muted-foreground">{post.frontmatter.description}</p>
      ) : null}

      <article className="mt-10">
        <MarkdownContent content={post.content} ext={post.ext} />
      </article>
    </main>
  );
}

