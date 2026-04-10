"use client";

import { useCallback, useEffect, useState } from "react";

type StatusPayload = {
  ok: boolean;
  vercelEnv: string;
  vercelUrl: string | null;
  deploymentId: string | null;
};

type SessionPayload = {
  ok: boolean;
  admin?: boolean;
  configured?: boolean;
};

function envLabel(env: string) {
  if (env === "production") return "生产";
  if (env === "preview") return "预览";
  if (env === "development") return "本地";
  return env;
}

export default function SystemStatus() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [adminConfigured, setAdminConfigured] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json()) as SessionPayload;
      if (res.ok && data.ok) {
        setIsAdmin(Boolean(data.admin));
        setAdminConfigured(data.configured !== false);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/system/status", { cache: "no-store" });
        const data = (await res.json()) as StatusPayload;
        if (!cancelled) {
          if (res.ok && data.ok) {
            setStatus(data);
            setStatusError(null);
          } else {
            setStatusError("状态不可用");
          }
        }
      } catch {
        if (!cancelled) setStatusError("状态不可用");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const handleUnlock = async () => {
    setUnlockError(null);
    try {
      const res = await fetch("/api/auth/unlock", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secretInput.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok) {
        setUnlockError(data.error ?? "解锁失败");
        return;
      }
      setSecretInput("");
      setPanelOpen(false);
      await refreshSession();
    } catch {
      setUnlockError("网络错误");
    }
  };

  const handleLock = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      /* 忽略 */
    }
    setPanelOpen(false);
    await refreshSession();
  };

  const vercelEnv = status?.vercelEnv ?? "…";
  const envTone =
    vercelEnv === "production"
      ? "bg-emerald-500/90"
      : vercelEnv === "preview"
        ? "bg-amber-500/90"
        : "bg-slate-400/90";

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 text-[10px] font-mono text-slate-500">
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        {/* 部署状态 */}
        <div className="flex items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[#f9f9f7]/90 px-2.5 py-1 shadow-sm backdrop-blur-sm">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${envTone}`}
            title={statusError ?? vercelEnv}
          />
          <span className="text-[#2c2c2c]/80">
            Vercel · {statusError ?? envLabel(vercelEnv)}
          </span>
        </div>

        {/* 权限与管理入口 */}
        <div className="flex flex-col items-end gap-1.5 rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7]/95 p-2 shadow-sm backdrop-blur-sm">
          <button
            type="button"
            onClick={() => {
              setPanelOpen((v) => !v);
              setUnlockError(null);
            }}
            className="flex w-full items-center justify-end gap-2 rounded-full px-2 py-1 text-left transition-colors hover:bg-[color:var(--color-wash)]/80"
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${isAdmin ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            <span className="text-[#2c2c2c]/90">
              {!sessionChecked
                ? "…"
                : isAdmin
                  ? "ADMIN MODE"
                  : "READ ONLY"}
            </span>
            <span className="text-slate-400">▾</span>
          </button>

          {panelOpen && (
            <div className="w-52 space-y-2 border-t border-[color:var(--color-border)]/80 pt-2">
              {sessionChecked && !adminConfigured && (
                <p className="text-[9px] text-amber-700/90">
                  未配置 NEXT_PUBLIC_ADMIN_SECRET（或 CHAT_API_SECRET），解锁不可用。
                </p>
              )}
              {!isAdmin ? (
                <>
                  <label className="block text-[9px] text-slate-500">
                    管理员凭证（与 .env 中密钥一致，经服务端校验）
                    <input
                      type="password"
                      value={secretInput}
                      onChange={(e) => setSecretInput(e.target.value)}
                      className="mt-1 w-full rounded-md border border-[color:var(--color-border)] bg-white/80 px-2 py-1 text-[10px] text-[#2c2c2c] outline-none ring-0 focus:border-slate-400"
                      placeholder="NEXT_PUBLIC_ADMIN_SECRET"
                      autoComplete="off"
                    />
                  </label>
                  {unlockError && (
                    <p className="text-[9px] text-red-600/90">{unlockError}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleUnlock()}
                    disabled={!adminConfigured}
                    className="w-full rounded-full bg-[#2c2c2c] py-1.5 text-[10px] text-[#f9f9f7] transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    解锁
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleLock()}
                  className="w-full rounded-full border border-[color:var(--color-border)] py-1.5 text-[10px] text-[#2c2c2c]/90 transition-colors hover:bg-[color:var(--color-wash)]/80"
                >
                  退出管理
                </button>
              )}
              <p className="text-[9px] leading-relaxed text-slate-400">
                调用 /api/chat 时请附带{" "}
                <span className="text-slate-500">Authorization: Bearer …</span>{" "}
                或{" "}
                <span className="text-slate-500">x-blog-admin-token</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-none text-right opacity-50 transition-opacity hover:opacity-100">
        Built with Next.js & SiliconFlow
      </div>
    </div>
  );
}
