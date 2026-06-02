import Link from "next/link";

import { BackButton } from "@/app/_components/back-button";
import { PortfolioContentEmpty } from "@/app/_components/portfolio-content-empty";
import { PortfolioMarkdown } from "@/app/_components/portfolio-markdown";
import { getPortfolioPreferredDoc } from "@/lib/content/get-portfolio-doc";

export const metadata = {
  title: "方法论证据卡 · 刘新宁",
  description: "Harness × 图谱 · 小样本边界说明",
};

export default function EvidencePage() {
  const { doc, missing } = getPortfolioPreferredDoc(
    "evidence",
    "methodology-card",
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <BackButton />
      <p className="text-xs tracking-wide text-slate-500">证据</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2C2C2C]">
        {doc?.title ?? "方法论证据卡"}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        问题 → Harness × 图谱 → 数字 → 边界（小样本演示）。
      </p>

      {missing || !doc ? (
        <PortfolioContentEmpty category="evidence" />
      ) : (
        <PortfolioMarkdown doc={doc} />
      )}

      <div className="mt-12 rounded-2xl border border-[color:var(--color-border)] bg-white/35 px-5 py-4 text-sm text-slate-600">
        <p className="font-medium text-[#2C2C2C]">五问参考（chip 文案归 W4）</p>
        <p className="mt-2">
          完整五问 chip 与 Unified Chat 联调见 W4/W6；本页供面试官快速扫证据结构。
        </p>
        <p className="mt-2">
          <Link href="/methodology" className="underline underline-offset-2">
            ← 方法论目录
          </Link>
        </p>
      </div>
    </main>
  );
}
