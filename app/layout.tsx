import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';

import { SiteNav } from "@/app/_components/site-nav";
import SystemStatus from "@/components/SystemStatus";

import "./globals.css";

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
        <SystemStatus />
        <Analytics />
      </body>
    </html>
  );
}
