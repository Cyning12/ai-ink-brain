"use client";

import type { ComponentPropsWithoutRef } from "react";

import {
  MARKDOWN_BLOCK_CODE_CLASS,
  MARKDOWN_INLINE_CODE_CLASS,
} from "@/components/markdown/markdown-prose";
import { MermaidBlock } from "@/components/markdown/mermaid-block";

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
};

/** react-markdown / MDX 共用 code 渲染：inline · 代码块 · mermaid。 */
export function MarkdownCode({
  inline,
  className,
  children,
  ...props
}: MarkdownCodeProps) {
  const text = String(children).replace(/\n$/, "");
  const lang = /language-(\w+)/.exec(className ?? "")?.[1]?.toLowerCase();

  if (inline) {
    return (
      <code className={MARKDOWN_INLINE_CODE_CLASS} {...props}>
        {children}
      </code>
    );
  }

  if (lang === "mermaid") {
    return <MermaidBlock code={text} />;
  }

  return (
    <pre className={MARKDOWN_BLOCK_CODE_CLASS}>
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
}

export const markdownComponents = {
  pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  code: MarkdownCode,
};
