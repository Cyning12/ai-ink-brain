import { MarkdownContent } from "@/app/_components/markdown-content";

import type { PortfolioDoc } from "@/lib/content/get-portfolio-doc";

type PortfolioMarkdownProps = {
  doc: PortfolioDoc;
};

/** Portfolio 静态页 Markdown 渲染（水墨 prose · GFM · 公式 · Mermaid）。 */
export function PortfolioMarkdown({ doc }: PortfolioMarkdownProps) {
  return (
    <article className="mt-10">
      <MarkdownContent content={doc.content} ext={doc.ext} />
    </article>
  );
}
