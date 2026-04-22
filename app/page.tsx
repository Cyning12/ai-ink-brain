import Link from "next/link";

const modules = [
  { id: "blog-log", title: "学习日志", href: "/blog", hint: "笔记与检索" },
  {
    id: "blog-resources",
    title: "学习资源",
    href: "/learning",
    hint: "content/learning",
  },
  { id: "chat", title: "对话", href: "/chat", hint: "RAG Chat" },
  { id: "tasks", title: "任务", href: "/projects", hint: "content/tasks" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-8 py-28">
        <p className="text-[11px] tracking-[0.45em] text-slate-500/90">
          水墨
        </p>
        <h1 className="mt-8 font-serif text-[clamp(2rem,6vw,3rem)] font-semibold leading-tight tracking-tight text-[#2C2C2C]">
          Cyning
        </h1>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-600/95">
          低密度留白，墨色为骨；学习、实验与日常，分册而置。
        </p>

        <div
          className="mt-3 h-px w-12 bg-[color:var(--color-border)]"
          aria-hidden
        />

        <nav
          className="mt-16 grid gap-8 sm:grid-cols-3 sm:gap-6"
          aria-label="站点模块"
        >
          {modules.map((m) => (
            <Link
              key={m.id}
              href={m.href}
              className="group rounded-2xl border border-[color:var(--color-border)] bg-white/35 px-6 py-7 transition-[background-color,border-color] hover:border-slate-300/80 hover:bg-[color:var(--color-wash)]/45"
            >
              <span className="block font-serif text-lg text-[#2C2C2C] transition-colors group-hover:text-slate-800">
                {m.title}
              </span>
              <span className="mt-2 block text-xs text-slate-500">
                {m.hint}
              </span>
            </Link>
          ))}
        </nav>
      </main>

      <footer className="mt-auto border-t border-[color:var(--color-border)]/70">
        <div className="mx-auto max-w-3xl px-8 py-10 text-center text-[11px] tracking-wide text-slate-400">
          © {new Date().getFullYear()} Cyning · Ink
        </div>
      </footer>
    </div>
  );
}
