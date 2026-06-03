/** Portfolio / 博客 Markdown 富文本 prose 样式（水墨风）。 */
export const MARKDOWN_PROSE_CLASS =
  "space-y-4 text-base leading-7 text-[#2C2C2C] " +
  "[&_p]:text-pretty [&_a]:text-slate-700 [&_a]:underline [&_a]:underline-offset-2 " +
  "[&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold " +
  "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold " +
  "[&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal [&_li]:my-1 " +
  "[&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:text-slate-600 " +
  "[&_hr]:my-8 [&_hr]:border-[color:var(--color-border)] " +
  "[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm " +
  "[&_th]:border [&_th]:border-[color:var(--color-border)] [&_th]:bg-slate-50/80 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left " +
  "[&_td]:border [&_td]:border-[color:var(--color-border)] [&_td]:px-3 [&_td]:py-2 " +
  "[&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg " +
  "[&_.katex-display]:my-6 [&_.katex-display]:overflow-x-auto";

export const MARKDOWN_INLINE_CODE_CLASS =
  "rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-slate-800";

export const MARKDOWN_BLOCK_CODE_CLASS =
  "block overflow-x-auto rounded-xl border border-[color:var(--color-border)] bg-slate-50/90 p-4 font-mono text-sm leading-relaxed text-slate-800";
