import "./globals.css";

import type { Metadata } from "next";
import Link from "next/link";

import { SiteNav } from "@/app/_components/site-nav";
import SystemStatus from "@/components/SystemStatus";

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
        <Link
          href="/chat"
          className="fixed bottom-4 right-4 z-[60] grid h-12 w-12 place-items-center rounded-full border border-[color:var(--color-border)] bg-[#f9f9f7]/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-[color:var(--color-wash)]/70"
          aria-label="打开独立对话页"
          title="对话"
        >
          {/* 极简墨滴图标 */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-[#2c2c2c]"
          >
            <path
              d="M12 3c3.5 4.2 6 7.4 6 11a6 6 0 1 1-12 0c0-3.6 2.5-6.8 6-11Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </body>
    </html>
  );
}
