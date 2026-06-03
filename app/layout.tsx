import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from "next";

import { SiteNav } from "@/app/_components/site-nav";
import { getSiteMode } from "@/lib/site-mode";
// SystemStatus 已移至顶部导航栏（SiteNav），避免右下角遮挡

const DEVELOPMENT_METADATA: Metadata = {
  title: "AI-Ink-Brain",
  description: "RAG 驱动的个人知识库与智能博客",
};

const PORTFOLIO_METADATA: Metadata = {
  title: "刘新宁 · AI Coding / Agent 应用",
  description: "个人全栈 RAG 演示：方法论 · 简历 · Unified Chat",
};

export function generateMetadata(): Metadata {
  return getSiteMode() === "portfolio" ? PORTFOLIO_METADATA : DEVELOPMENT_METADATA;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
