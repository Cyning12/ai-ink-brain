"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** db 模式：session 到期后自动跳转登录页（含页面停留 · 切 tab · 软导航）。 */
export function OpsSessionGuard({ expiresAtMs }: { expiresAtMs?: number }) {
  const pathname = usePathname();

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    function goLogin() {
      if (cancelled) return;
      window.location.assign("/ops/login?expired=1");
    }

    function schedulePoll(delayMs: number) {
      pollTimer = setTimeout(() => {
        if (!cancelled) void pollSession();
      }, delayMs);
    }

    async function pollSession() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/ops/auth/session", { cache: "no-store" });
        if (!res.ok) {
          goLogin();
          return;
        }
        const data = (await res.json()) as { expiresAt?: string };
        if (data.expiresAt) {
          const remaining = new Date(data.expiresAt).getTime() - Date.now();
          if (remaining <= 0) {
            goLogin();
            return;
          }
          // 临近过期更密 poll；远则最多 30s
          const delay =
            remaining <= 60_000 ? Math.max(500, remaining) : Math.min(remaining, 30_000);
          schedulePoll(delay);
          return;
        }
      } catch {
        /* 单次网络失败不踢出 */
      }
      schedulePoll(30_000);
    }

    if (expiresAtMs !== undefined) {
      const remaining = expiresAtMs - Date.now();
      if (remaining <= 0) {
        goLogin();
        return;
      }
      expiryTimer = setTimeout(goLogin, remaining);
    }

    void pollSession();

    function onVisible() {
      if (document.visibilityState === "visible") {
        void pollSession();
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (expiryTimer) clearTimeout(expiryTimer);
      if (pollTimer) clearTimeout(pollTimer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [expiresAtMs, pathname]);

  return null;
}
