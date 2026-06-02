import { MDXRemote } from "next-mdx-remote/rsc";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { PortfolioDoc } from "@/lib/content/get-portfolio-doc";

type PortfolioMarkdownProps = {
  doc: PortfolioDoc;
};

/** Portfolio 静态页 Markdown 渲染（水墨 prose）。 */
export function PortfolioMarkdown({ doc }: PortfolioMarkdownProps) {
  return (
    <article className="mt-10 space-y-4 text-base leading-7 text-[#2C2C2C] [&_code]:rounded-md [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-pretty [&_a]:text-slate-700 [&_a]:underline [&_a]:underline-offset-2">
      {doc.ext === "mdx" ? (
        <MDXRemote source={doc.content} />
      ) : (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{doc.content}</ReactMarkdown>
      )}
    </article>
  );
}
