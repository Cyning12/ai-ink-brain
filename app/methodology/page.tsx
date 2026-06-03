import Link from "next/link";
import { BackButton } from "@/app/_components/back-button";
import { PortfolioContentEmpty } from "@/app/_components/portfolio-content-empty";
import { listPortfolioDocs } from "@/lib/content/get-portfolio-doc";

export const metadata = {
  title: "方法论 · 刘新宁",
  description: "《AI 编程可闭环协作》连载与 Harness 实践",
};

export default function MethodologyIndexPage() {
  const docs = listPortfolioDocs("methodology");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <BackButton />
      <p className="text-xs tracking-wide text-slate-500">方法论</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2C2C2C]">
        AI 编程可闭环协作
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        系列 v1.3.0 · 卷一～五连载；下方为已同步至本演示站的正文。
      </p>
      <p className="mt-2 text-sm">
        <a
          href="https://github.com/Cyning12/ai-coding-closed-loop-articles"
          className="text-slate-700 underline underline-offset-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub 公众连载仓
        </a>
      </p>

      {docs.length === 0 ? (
        <PortfolioContentEmpty category="methodology" />
      ) : (
        <ul className="mt-10 space-y-4">
          {docs.map((doc) => (
            <li
              key={doc.slug}
              className="rounded-2xl border border-[color:var(--color-border)] bg-white/35 px-5 py-4"
            >
              <Link
                href={`/methodology/${doc.slug}`}
                className="group block font-serif text-lg text-[#2C2C2C] transition-colors group-hover:text-slate-800"
              >
                {doc.title}
              </Link>
              {doc.description ? (
                <p className="mt-1 text-sm text-slate-600">{doc.description}</p>
              ) : null}
              <span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] tracking-wide text-slate-600">
                已发表
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
