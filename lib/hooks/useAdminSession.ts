"use client";

import { useCallback, useEffect, useState } from "react";

export type AuthRole = "none" | "visitor" | "visitor-admin" | "admin";

type SessionPayload = {
  ok: boolean;
  admin?: boolean;
  role?: AuthRole;
  configured?: boolean;
  expiresAt?: string;
};

export function useAdminSession(): {
  checked: boolean;
  isAdmin: boolean;
  role: AuthRole;
  configured: boolean;
  expiresAt: string | null;
  /** Portfolio visitor / visitor-admin 或 legacy admin */
  canSendUnifiedChat: boolean;
  refresh: () => Promise<void>;
} {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState<AuthRole>("none");
  const [configured, setConfigured] = useState(true);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as SessionPayload;
      if (res.ok && data.ok) {
        const r =
          data.role === "visitor" ||
          data.role === "visitor-admin" ||
          data.role === "admin"
            ? data.role
            : "none";
        setRole(r);
        setIsAdmin(Boolean(data.admin));
        setConfigured(data.configured !== false);
        setExpiresAt(typeof data.expiresAt === "string" ? data.expiresAt : null);
      } else {
        setIsAdmin(false);
        setRole("none");
        setExpiresAt(null);
      }
    } catch {
      setIsAdmin(false);
      setRole("none");
      setExpiresAt(null);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const canSendUnifiedChat =
    role === "visitor" || role === "visitor-admin" || role === "admin";

  return {
    checked,
    isAdmin,
    role,
    configured,
    expiresAt,
    canSendUnifiedChat,
    refresh,
  };
}
