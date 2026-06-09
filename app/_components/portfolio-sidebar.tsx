"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import SystemStatus from "@/components/SystemStatus";
import {
  isPortfolioNavActive,
  PORTFOLIO_NAV,
} from "@/lib/portfolio-nav";

export function PortfolioSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-44 shrink-0 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-background)] sm:w-48 md:w-52">
      <div className="px-5 py-8">
        <Link
          href="/"
          className="block font-serif text-lg font-semibold tracking-tight text-[#2C2C2C] transition-colors hover:text-slate-800"
        >
          刘新宁
        </Link>
        <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
          AI Coding · RAG 演示
        </p>
      </div>

      <nav className="flex-1 px-3" aria-label="站点目录">
        <p className="mb-2 px-2 text-[10px] font-medium tracking-[0.2em] text-slate-400">
          目录
        </p>
        <ul className="space-y-0.5">
          {PORTFOLIO_NAV.map((item) => {
            const active = isPortfolioNavActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-[color:var(--color-wash)] font-medium text-[#2C2C2C]"
                      : "text-slate-600 hover:bg-[color:var(--color-wash)]/50 hover:text-[#2C2C2C]",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[color:var(--color-border)] px-4 py-4">
        <SystemStatus variant="nav" />
      </div>
    </aside>
  );
}
