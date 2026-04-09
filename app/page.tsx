import Link from "next/link";
import { SiteNav } from "./_components/site-nav";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteNav />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          <section className="md:col-span-7">
            <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight">
              以水墨为壳，以向量为骨。
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--color-muted)]">
              这是一个 RAG 驱动的个人知识库与博客实验场：沉淀学习日志、展示 AI
              Demo，并提供可引用来源的语义检索与对话。
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/blog"
                className="rounded-full bg-[color:var(--color-foreground)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-background)] transition-colors hover:opacity-90"
              >
                进入 Blog
              </Link>
              <Link
                href="/projects"
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-background)] px-5 py-2.5 text-sm font-medium text-[color:var(--color-foreground)] transition-colors hover:bg-[color:var(--color-wash)]/70"
              >
                查看 Projects
              </Link>
            </div>
          </section>

          <aside className="md:col-span-5">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-white/50 p-6">
              <div className="text-sm font-semibold">当前里程碑</div>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-muted)]">
                <li>UI：纸张底色 + 衬线标题 + 极简导航</li>
                <li>RAG：Supabase（pgvector）持久化向量</li>
                <li>上传：MDX/PDF 分块（512/50）与 Embedding 入库</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-[color:var(--color-border)]">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 text-xs text-[color:var(--color-muted)]">
          <span>© {new Date().getFullYear()} AI-Ink-Brain</span>
          <span>Ink UI · RAG Core</span>
        </div>
      </footer>
    </div>
  );
}
