import type { Options as ReactMarkdownOptions } from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

/** Portfolio / 博客 Markdown：允许受控 HTML（表格、blockquote、hr 等）。 */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    "section",
    "div",
    "span",
  ],
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), "className", "class"],
    section: [...(defaultSchema.attributes?.section ?? []), "className", "class"],
    span: [...(defaultSchema.attributes?.span ?? []), "className", "class"],
    a: [...(defaultSchema.attributes?.a ?? []), "href", "title", "target", "rel"],
    th: [...(defaultSchema.attributes?.th ?? []), "colspan", "rowspan", "align"],
    td: [...(defaultSchema.attributes?.td ?? []), "colspan", "rowspan", "align"],
  },
};

export const CONTENT_REHYPE_PLUGINS = [
  rehypeRaw,
  [rehypeSanitize, sanitizeSchema],
  rehypeKatex,
] as ReactMarkdownOptions["rehypePlugins"];
