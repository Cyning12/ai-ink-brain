import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { getAllPostSlugParts, getPostBySlugParts } from "@/lib/content/mdx-posts";
import { BackButton } from "@/app/_components/back-button";

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
    // 学习日志：diary；项目文档：demos；保留 legacy：content/*.mdx
    .filter((parts) => parts[0] === "diary" || parts[0] === "demos" || parts.length === 1)
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
  // Blog 仅展示学习日志（diary）、项目文档（demos）以及早期无分类文章（legacy：content/*.mdx）
  if (!(slug[0] === "diary" || slug[0] === "demos" || slug.length === 1)) notFound();
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

      <article className="mt-10 space-y-4 text-base leading-7 text-foreground [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:text-2xl [&_h1]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-pretty">
        {post.ext === "mdx" ? (
          <MDXRemote source={post.content} />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        )}
      </article>
    </main>
  );
}

