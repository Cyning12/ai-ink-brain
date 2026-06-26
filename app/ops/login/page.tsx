"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function LoginForm() {
  const params = useSearchParams();
  const demoToken = params.get("token") ?? "";
  const sessionExpired = params.get("expired") === "1";

  const [token, setToken] = useState(demoToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoToken) {
      void submit(demoToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoToken]);

  async function submit(value: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ops/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: value }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "登录失败");
        return;
      }
      // 硬跳转：确保 Set-Cookie 后的首次导航带上 ops_desk_session
      window.location.assign("/ops/kimi-code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="mx-auto w-full max-w-sm rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-8 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        void submit(token);
      }}
    >
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
        Ops Desk
      </h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
        请输入邀请密钥以进入 Kimi Code 看板
      </p>

      {sessionExpired && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          登录已过期，请重新登录
        </p>
      )}

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-[color:var(--color-muted-foreground)]">
          邀请密钥
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="邀请密钥"
            className="mt-1 block w-full rounded-lg border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none focus:ring-2 focus:ring-[color:var(--color-ring)]"
            disabled={loading}
            autoFocus
          />
        </label>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading || !token.trim()}
          className="w-full rounded-lg bg-[color:var(--color-foreground)] px-4 py-2 text-sm font-medium text-[color:var(--color-background)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {loading ? "校验中…" : "进入"}
        </button>
      </div>
    </form>
  );
}

export default function OpsLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-24">
      <Suspense fallback={<div className="text-sm text-[color:var(--color-muted-foreground)]">加载中…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
