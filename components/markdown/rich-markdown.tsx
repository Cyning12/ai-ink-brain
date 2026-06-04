"use client";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { markdownComponents } from "@/components/markdown/markdown-code";
import { MARKDOWN_PROSE_CLASS } from "@/components/markdown/markdown-prose";

type RichMarkdownProps = {
  source: string;
  className?: string;
};

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeKatex];

/** 富文本 Markdown（Client）：GFM · KaTeX · Mermaid。 */
export function RichMarkdown({ source, className = "" }: RichMarkdownProps) {
  const proseClass = [MARKDOWN_PROSE_CLASS, className].filter(Boolean).join(" ");

  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={REHYPE_PLUGINS}
        components={markdownComponents}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
