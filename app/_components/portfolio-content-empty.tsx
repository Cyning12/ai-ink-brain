/** W5 语料缺失时的页内降级（F1 · 非 500）。 */
export function PortfolioContentEmpty({ category }: { category: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-dashed border-slate-300/80 bg-white/40 px-6 py-8 text-sm leading-relaxed text-slate-600">
      <p className="font-medium text-[#2C2C2C]">内容未同步</p>
      <p className="mt-2">
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
          content/{category}/
        </code>{" "}
        下暂无 Markdown 文件。请在本机运行{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
          tools/sync-portfolio-content.sh
        </code>{" "}
        后刷新页面。
      </p>
    </div>
  );
}
