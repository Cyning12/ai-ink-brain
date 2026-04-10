import { useCallback, useMemo, useState } from "react";

function safeRandomUUID(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // 极端兜底：不追求强随机，仅保证足够分散
  return `sid_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function readLocalStorage(key: string): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(key)?.trim() ?? "";
  } catch {
    return "";
  }
}

function writeLocalStorage(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export function useSessionId(scopeKey?: string): {
  sessionId: string;
  resetSession: () => string;
} {
  const storageKey = useMemo(() => {
    const scope =
      (scopeKey?.trim() ||
        (typeof window !== "undefined" ? window.location.pathname : "default")) ??
      "default";
    return `rag_session_id:${scope}`;
  }, [scopeKey]);

  const [sessionId, setSessionId] = useState(() => {
    const existing = readLocalStorage(storageKey);
    if (existing) return existing;
    const next = safeRandomUUID();
    writeLocalStorage(storageKey, next);
    return next;
  });

  const resetSession = useCallback(() => {
    const next = safeRandomUUID();
    writeLocalStorage(storageKey, next);
    setSessionId(next);
    return next;
  }, [storageKey]);

  return { sessionId, resetSession };
}

