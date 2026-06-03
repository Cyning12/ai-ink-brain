import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { markdownComponents } from "@/components/markdown/markdown-code";
import { MARKDOWN_PROSE_CLASS } from "@/components/markdown/markdown-prose";
import { RichMarkdown } from "@/components/markdown/rich-markdown";

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeKatex];

type MarkdownContentProps = {
  content: string;
  ext: "md" | "mdx";
  className?: string;
};

/** Server：按扩展名渲染 Markdown / MDX 富文本。 */
export function MarkdownContent({ content, ext, className = "" }: MarkdownContentProps) {
  const proseClass = [MARKDOWN_PROSE_CLASS, className].filter(Boolean).join(" ");

  if (ext === "mdx") {
    return (
      <div className={proseClass}>
        <MDXRemote
          source={content}
          components={markdownComponents}
          options={{
            mdxOptions: {
              remarkPlugins: REMARK_PLUGINS,
              rehypePlugins: REHYPE_PLUGINS,
            },
          }}
        />
      </div>
    );
  }

  return <RichMarkdown source={content} className={className} />;
}
