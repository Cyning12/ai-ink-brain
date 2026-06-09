import { HomeModules } from "@/app/_components/home-modules";

/** Portfolio 根演示首页（§4.6.1 · 静态 · 非 redirect）。 */
export function PortfolioHome() {
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col  px-8 py-28">
        <h1 className="mt-8 font-serif text-[clamp(2rem,6vw,3rem)] font-semibold leading-tight tracking-tight text-[#2C2C2C]">
          刘新宁
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          11 年软件开发 · 北京 · AI Coding / Agent 应用
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600/95">
          腾讯云架构师同盟；连载《AI 编程可闭环协作》卷一～五；个人{" "}
          <strong className="font-medium text-[#2C2C2C]">RAG + 对话</strong>{" "}
          全栈演示项目。
        </p>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600/95">
          AI 主导编码、人负责架构与验收 — Next.js 由 Agent 实现，本人验收
          SSE/RAG 契约。
        </p>

        <div
          className="mt-6 h-px w-12 bg-[color:var(--color-border)]"
          aria-hidden
        />

        <HomeModules />

        <p className="mt-10 text-xs leading-relaxed text-slate-500">
          RAG 对话需{" "}
          <a
            href="mailto:231127227@qq.com"
            className="underline underline-offset-2"
          >
            邮件 231127227@qq.com
          </a>{" "}
          申请临时秘钥。
        </p>

        <p className="mt-4 text-[11px] text-slate-400">
          <a
            href="https://github.com/Cyning12/ai-ink-brain"
            className="underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub 代码仓
          </a>
        </p>
      </main>

      <footer className="mt-auto border-t border-[color:var(--color-border)]/70">
        <div className="mx-auto max-w-3xl px-8 py-10 text-center text-[11px] tracking-wide text-slate-400">
          © {year} 刘新宁 · 演示站
        </div>
      </footer>
    </div>
  );
}
