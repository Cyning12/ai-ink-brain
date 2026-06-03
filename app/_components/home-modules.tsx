"use client";

import Link from "next/link";

import { useAdminSession } from "@/lib/hooks/useAdminSession";
import { isPortfolioMode } from "@/lib/site-mode";

type HomeModule = {
  id: string;
  title: string;
  href: string;
  hint: string;
};

const DEVELOPMENT_BASE_MODULES: HomeModule[] = [
  { id: "blog-log", title: "学习日志", href: "/blog", hint: "笔记与检索" },
  { id: "blog-resources", title: "学习资源", href: "/learning", hint: "content/learning" },
  {
    id: "tasks",
    title: "任务",
    href: "/projects",
    hint: "docs/tasks/active · done",
  },
];

const DEVELOPMENT_ADMIN_MODULES: HomeModule[] = [
  { id: "chat", title: "对话", href: "/chat", hint: "RAG Chat" },
  { id: "text2sql", title: "Text2SQL", href: "/text2sql", hint: "查库" },
  { id: "chain-chat", title: "Chain Chat", href: "/chain-chat", hint: "工具调用时间线（v1）" },
  {
    id: "unified-chat",
    title: "Unified Chat",
    href: "/unified-chat",
    hint: "RAG + Text2SQL + Timeline",
  },
];

const PORTFOLIO_MODULES: HomeModule[] = [
  { id: "resume", title: "简历", href: "/resume", hint: "在线简历 · 与 RAG 同源" },
  {
    id: "methodology",
    title: "方法论",
    href: "/methodology",
    hint: "连载卷一～五",
  },
  {
    id: "unified-chat",
    title: "对话",
    href: "/unified-chat",
    hint: "RAG + 流式 · 需秘钥发消息",
  },
];

export function HomeModules() {
  const { isAdmin } = useAdminSession();
  const portfolio = isPortfolioMode();

  const modules = portfolio
    ? PORTFOLIO_MODULES
    : isAdmin
      ? [...DEVELOPMENT_BASE_MODULES, ...DEVELOPMENT_ADMIN_MODULES]
      : DEVELOPMENT_BASE_MODULES;

  return (
    <nav className="mt-16 grid gap-8 sm:grid-cols-3 sm:gap-6" aria-label="站点模块">
      {modules.map((m) => (
        <Link
          key={m.id}
          href={m.href}
          className="group rounded-2xl border border-[color:var(--color-border)] bg-white/35 px-6 py-7 transition-[background-color,border-color] hover:border-slate-300/80 hover:bg-[color:var(--color-wash)]/45"
        >
          <span className="block font-serif text-lg text-[#2C2C2C] transition-colors group-hover:text-slate-800">
            {m.title}
          </span>
          <span className="mt-2 block text-xs text-slate-500">{m.hint}</span>
        </Link>
      ))}
    </nav>
  );
}
