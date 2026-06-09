import { notFound } from "next/navigation";

import { BackButton } from "@/app/_components/back-button";
import { PortfolioMarkdown } from "@/app/_components/portfolio-markdown";
import {
  getAllMethodologySlugParams,
  getPortfolioDocBySlug,
  normalizePortfolioSlugParts,
} from "@/lib/content/get-portfolio-doc";

type PageProps = {
  params: Promise<{ slug: string | string[] | undefined }>;
};

export async function generateStaticParams() {
  return getAllMethodologySlugParams();
}

export async function generateMetadata({ params }: PageProps) {
  const slug = normalizePortfolioSlugParts((await params).slug);
  const doc = getPortfolioDocBySlug("methodology", slug);
  if (!doc) return { title: "Not Found" };
  return {
    title: `${doc.title} · 方法论`,
    description: doc.description,
  };
}

export default async function MethodologyArticlePage({ params }: PageProps) {
  const slug = normalizePortfolioSlugParts((await params).slug);
  if (slug.length === 0) notFound();

  const doc = getPortfolioDocBySlug("methodology", slug);
  if (!doc) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <BackButton showInPortfolio href="/methodology" label="返回方法论" />
      {doc.date ? (
        <p className="text-xs text-slate-500">{doc.date}</p>
      ) : null}
      <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#2C2C2C]">
        {doc.title}
      </h1>
      {doc.description ? (
        <p className="mt-3 text-sm text-slate-600">{doc.description}</p>
      ) : null}
      <PortfolioMarkdown doc={doc} />
    </main>
  );
}
