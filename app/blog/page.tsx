import Link from "next/link";

import { getAllPostsMeta } from "@/lib/content/mdx-posts";

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        学习日志列表；正文来自 <code className="text-xs">content/*.mdx</code>。
      </p>

      <ul className="mt-10 space-y-4">
        {posts.map((p) => (
          <li
            key={p.slug}
            className="rounded-2xl border border-border bg-card/40 px-5 py-4"
          >
            <Link
              href={`/blog/${p.slug}`}
              className="text-lg font-semibold tracking-tight hover:opacity-80"
            >
              {p.title}
            </Link>
            {p.description ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {p.description}
              </p>
            ) : null}
            {p.date ? (
              <p className="mt-2 text-xs text-muted-foreground">{p.date}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  );
}

