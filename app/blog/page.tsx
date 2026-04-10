import Link from "next/link";

import { getAllPostsMeta } from "@/lib/content/mdx-posts";
import { BackButton } from "@/app/_components/back-button";

export default function BlogPage() {
  // 学习日志 = content/diary
  const posts = getAllPostsMeta().filter((p) => p.category === "diary");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight">学习日志</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        默认展示 <code className="text-xs">content/diary</code> 下的{" "}
        <code className="text-xs">.md/.mdx</code>。
      </p>

      {posts.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-card/40 px-5 py-6 text-sm text-muted-foreground">
          目前还没有学习日志。请在{" "}
          <code className="text-xs">content/diary</code> 下新增{" "}
          <code className="text-xs">.md/.mdx</code> 文件，并确保 frontmatter
          至少包含 <code className="text-xs">title</code>（可选{" "}
          <code className="text-xs">date</code> /{" "}
          <code className="text-xs">description</code>）。
        </div>
      ) : (
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
      )}
    </main>
  );
}

