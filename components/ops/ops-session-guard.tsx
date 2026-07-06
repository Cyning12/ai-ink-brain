"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const INITIAL_POLL_DELAY_MS = 2_000;
/** setTimeout 上限（约 24.8 天）；超出须靠 poll 续期，不能单次 timer 覆盖到 2026 */
const MAX_TIMEOUT_MS = 2_147_483_647;

/** db 模式：session 到期后自动跳转登录页（以 BFF session API 为准）。 */
export function OpsSessionGuard() {
  const pathname = usePathname();

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let consecutiveAuthFailures = 0;

    function goLogin() {
      if (cancelled) return;
      window.location.assign("/ops/login?expired=1");
    }

    function schedulePoll(delayMs: number) {
      pollTimer = setTimeout(() => {
        if (!cancelled) void pollSession();
      }, delayMs);
    }

    function scheduleExpiry(expiresAtIso: string) {
      if (expiryTimer) clearTimeout(expiryTimer);
      const remaining = new Date(expiresAtIso).getTime() - Date.now();
      if (remaining <= 0) {
        goLogin();
        return;
      }
      // 勿把数年后的 remaining 直接塞进 setTimeout（浏览器会当成 ~1ms，立刻踢人）
      if (remaining <= MAX_TIMEOUT_MS) {
        expiryTimer = setTimeout(goLogin, remaining);
      }
    }

    async function pollSession() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/ops/auth/session", {
          cache: "no-store",
          credentials: "include",
        });
        if (res.status === 503) {
          consecutiveAuthFailures = 0;
          schedulePoll(30_000);
          return;
        }
        if (!res.ok) {
          consecutiveAuthFailures += 1;
          // 避免单次抖动（middleware/Python 慢）误踢
          if (consecutiveAuthFailures >= 2) {
            goLogin();
            return;
          }
          schedulePoll(2_000);
          return;
        }
        consecutiveAuthFailures = 0;

        const data = (await res.json()) as { expiresAt?: string };
        if (data.expiresAt) {
          const remaining = new Date(data.expiresAt).getTime() - Date.now();
          if (remaining <= 0) {
            goLogin();
            return;
          }
          scheduleExpiry(data.expiresAt);
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

    schedulePoll(INITIAL_POLL_DELAY_MS);

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
  }, [pathname]);

  return null;
}
