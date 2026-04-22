"use client";

import { useCallback, useEffect, useState } from "react";

type SessionPayload = {
  ok: boolean;
  admin?: boolean;
  configured?: boolean;
};

export function useAdminSession(): {
  checked: boolean;
  isAdmin: boolean;
  configured: boolean;
  refresh: () => Promise<void>;
} {
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [configured, setConfigured] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as SessionPayload;
      if (res.ok && data.ok) {
        setIsAdmin(Boolean(data.admin));
        setConfigured(data.configured !== false);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { checked, isAdmin, configured, refresh };
}

