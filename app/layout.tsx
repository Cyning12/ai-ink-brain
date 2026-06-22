import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from "next";

import { PortfolioShell } from "@/app/_components/portfolio-shell";
import { SiteNav } from "@/app/_components/site-nav";
import { getSiteMode, isOpsMode } from "@/lib/site-mode";
// SystemStatus 已移至顶部导航栏（SiteNav），避免右下角遮挡

const DEVELOPMENT_METADATA: Metadata = {
  title: "AI-Ink-Brain",
  description: "RAG 驱动的个人知识库与智能博客",
};

const PORTFOLIO_METADATA: Metadata = {
  title: "刘新宁 · AI Coding / Agent 应用",
  description: "个人全栈 RAG 演示：方法论 · 简历 · Unified Chat",
};

const OPS_METADATA: Metadata = {
  title: "Ops Desk · Kimi Code",
  description: "MoonshotAI/kimi-code 只读 Issue/PR/CI 看板",
};

export function generateMetadata(): Metadata {
  const mode = getSiteMode();
  if (mode === "portfolio") return PORTFOLIO_METADATA;
  if (mode === "ops") return OPS_METADATA;
  return DEVELOPMENT_METADATA;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const portfolio = getSiteMode() === "portfolio";
  const ops = isOpsMode();

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {portfolio ? (
          <PortfolioShell>{children}</PortfolioShell>
        ) : (
          <>
            {!ops && <SiteNav />}
            <div className="flex-1">{children}</div>
          </>
        )}
        <Analytics />
      </body>
    </html>
  );
}
