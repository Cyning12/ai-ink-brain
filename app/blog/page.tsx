import { SiteNav } from "../_components/site-nav";

export default function BlogPage() {
  return (
    <div className="min-h-full">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mt-4 max-w-2xl text-[color:var(--color-muted)]">
          学习日志与文章列表（后续接入 MDX 与向量索引）。
        </p>
      </main>
    </div>
  );
}

