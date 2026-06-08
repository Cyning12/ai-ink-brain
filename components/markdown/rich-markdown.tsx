"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { markdownComponents } from "@/components/markdown/markdown-code";
import { MARKDOWN_PROSE_CLASS } from "@/components/markdown/markdown-prose";
import { CONTENT_REHYPE_PLUGINS } from "@/components/markdown/rehype-plugins";

type RichMarkdownProps = {
  source: string;
  className?: string;
};

const REMARK_PLUGINS = [remarkGfm, remarkMath];

/** 富文本 Markdown（Client）：GFM · KaTeX · Mermaid · 受控 HTML。 */
export function RichMarkdown({ source, className = "" }: RichMarkdownProps) {
  const proseClass = [MARKDOWN_PROSE_CLASS, className].filter(Boolean).join(" ");

  return (
    <div className={proseClass}>
      <ReactMarkdown
        remarkPlugins={REMARK_PLUGINS}
        rehypePlugins={CONTENT_REHYPE_PLUGINS}
        components={markdownComponents}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
