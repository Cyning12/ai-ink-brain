import Link from "next/link";

import { BackButton } from "@/app/_components/back-button";
import { PortfolioContentEmpty } from "@/app/_components/portfolio-content-empty";
import { PortfolioMarkdown } from "@/app/_components/portfolio-markdown";
import { getPortfolioPreferredDoc } from "@/lib/content/get-portfolio-doc";

export const metadata = {
  title: "在线简历 · 刘新宁",
  description: "Portfolio 演示在线简历，与 RAG 语料同源",
};

export default function ResumePage() {
  const { doc, missing } = getPortfolioPreferredDoc("resume", "cv-online");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <BackButton />
      <p className="text-xs tracking-wide text-slate-500">在线简历</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2C2C2C]">
        {doc?.title ?? "简历"}
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        与下方 Unified Chat RAG 语料同源（category: resume）。
      </p>

      {missing || !doc ? (
        <PortfolioContentEmpty category="resume" />
      ) : (
        <PortfolioMarkdown doc={doc} />
      )}

      <p className="mt-12 text-xs text-slate-500">
        <Link href="/unified-chat" className="underline underline-offset-2">
          RAG 对话
        </Link>{" "}
        需邮件申请临时秘钥。
      </p>
    </main>
  );
}
