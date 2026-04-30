import "./globals.css";

import { Analytics } from "@vercel/analytics/react";

import type { Metadata } from "next";

import { SiteNav } from "@/app/_components/site-nav";
// SystemStatus 已移至顶部导航栏（SiteNav），避免右下角遮挡

export const metadata: Metadata = {
  title: "AI-Ink-Brain",
  description: "RAG 驱动的个人知识库与智能博客",
};

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
