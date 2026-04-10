import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllSlugs, getPostBySlug } from "@/lib/content/mdx-posts";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: post.frontmatter.title,
    description: post.frontmatter.description,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p className="text-xs text-muted-foreground">
        {post.frontmatter.date ?? ""}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {post.frontmatter.title}
      </h1>
      {post.frontmatter.description ? (
        <p className="mt-4 text-muted-foreground">
          {post.frontmatter.description}
        </p>
      ) : null}

      <article className="mt-10 space-y-4 text-base leading-7 text-foreground [&_code]:rounded-md [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:text-2xl [&_h1]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-pretty">
        <MDXRemote source={post.content} />
      </article>
    </main>
  );
}
