import Link from "next/link";

import { BackButton } from "@/app/_components/back-button";
import { getAllPostsMeta } from "@/lib/content/mdx-posts";

export default function ProjectsPage() {
  const tasks = getAllPostsMeta().filter((p) => p.category === "tasks");

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        默认展示 <code className="text-xs">content/tasks/active</code> 与{" "}
        <code className="text-xs">content/tasks/done</code> 下的{" "}
        <code className="text-xs">.md/.mdx</code>（代码可用 Markdown 代码块格式化展示）。
      </p>

      {tasks.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-card/40 px-5 py-6 text-sm text-muted-foreground">
          目前还没有任务文档。请在{" "}
          <code className="text-xs">content/tasks/active</code> 下新增{" "}
          <code className="text-xs">.md/.mdx</code> 文件（完成后归档到{" "}
          <code className="text-xs">content/tasks/done</code>，见{" "}
          <code className="text-xs">content/tasks/README.md</code>）。
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {tasks.map((p) => (
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

