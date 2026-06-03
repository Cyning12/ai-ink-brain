import { PortfolioSidebar } from "@/app/_components/portfolio-sidebar";

/** Portfolio 模式外壳：左侧目录 + 右侧内容区。 */
export function PortfolioShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full w-full">
      <PortfolioSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
