"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { formatDateTime } from "@/lib/ops/format";
import {
  createOpsSession,
  fetchOpsSessions,
  type OpsSessionMeta,
} from "@/lib/ops/session";

function statusStyle(status: string): string {
  switch (status) {
    case "planning":
      return "bg-sky-50 text-sky-800 border-sky-200";
    case "awaiting_auth":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "dispatched":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "done":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "blocked":
      return "bg-rose-50 text-rose-800 border-rose-200";
    default:
      return "bg-[color:var(--color-muted)] text-[color:var(--color-muted-foreground)] border-[color:var(--color-border)]";
  }
}

export function OpsSessionsClient() {
  const router = useRouter();
  const [items, setItems] = useState<OpsSessionMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await fetchOpsSessions({ limit: 50 });
      if (cancelled) return;
      if (!data) {
        setError("加载 session 列表失败");
        setItems([]);
      } else {
        setItems(data.items);
        setError(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = useCallback(async () => {
    const s = slug.trim();
    const t = title.trim();
    if (!s || !t || creating || redirecting) return;

    setCreating(true);
    setError(null);
    const created = await createOpsSession({ slug: s, title: t });
    if (!created) {
      setCreating(false);
      setError("创建 session 失败");
      return;
    }
    setSlug("");
    setTitle("");
    setRedirecting(true);
    router.push(`/ops/kimi-code/sessions/${encodeURIComponent(created.session_id)}`);
  }, [slug, title, creating, redirecting, router]);

  const busy = creating || redirecting;

  return (
    <div className="relative space-y-6">
      {busy ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2c2c]/20 backdrop-blur-[1px]"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--color-border)] bg-white px-5 py-4 shadow-lg">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            <span className="text-sm text-slate-700">
              {redirecting ? "正在进入 Session…" : "正在创建 Session…"}
            </span>
          </div>
        </div>
      ) : null}
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Sessions
        </h1>
        <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
          Harness Session 多轮续聊 · 文件 meta + ops_runs 绑定
        </p>
      </div>

      <section className="space-y-3 rounded-2xl border border-[color:var(--color-border)] bg-white/40 px-4 py-4">
        <div className="font-serif text-sm text-[#2c2c2c]">新建 Session</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug，例如 ops-session-demo"
            className="rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题"
            className="rounded-xl border border-[color:var(--color-border)] bg-white/65 px-3 py-2 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={busy || !slug.trim() || !title.trim()}
          className="rounded-xl bg-[#2c2c2c] px-4 py-2 text-sm text-[#f9f9f7] disabled:opacity-40"
        >
          {busy ? (redirecting ? "跳转中…" : "创建中…") : "创建并进入"}
        </button>
      </section>

      {error ? (
        <section className="rounded-2xl border border-rose-200/90 bg-rose-50/90 px-4 py-3 text-sm text-rose-900">
          {error}
        </section>
      ) : null}

      <section className="overflow-x-auto rounded-xl border border-[color:var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-border)] bg-[color:var(--color-muted)]">
              <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">标题</th>
              <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">状态</th>
              <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">slug</th>
              <th className="px-4 py-3 text-left font-medium text-[color:var(--color-muted-foreground)]">更新于</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:var(--color-border)]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  加载中…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  暂无 session · 可在上方创建
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.session_id} className="transition-colors hover:bg-[color:var(--color-wash)]/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/ops/kimi-code/sessions/${encodeURIComponent(item.session_id)}`}
                      className="font-medium text-[color:var(--color-foreground)] hover:underline"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-500">{item.session_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${statusStyle(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{item.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDateTime(item.updated_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
