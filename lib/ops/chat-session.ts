import { useSyncExternalStore } from "react";

const STORAGE_KEY = "ops_chat_session_id";
let memoryFallback: string | null = null;

function subscribeToOpsChatSession(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function readStoredOpsChatSessionId(): string {
  try {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    }
  } catch {
    // 忽略 localStorage 异常
  }
  return memoryFallback ?? "";
}

/** 客户端订阅 localStorage 中的 session_id；SSR 快照恒为空，避免 hydration 不一致。 */
export function useOpsChatSessionId(): string {
  return useSyncExternalStore(subscribeToOpsChatSession, readStoredOpsChatSessionId, () => "");
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * 获取或创建 Ops Chat 的浏览器 session_id。
 *
 * - 优先读取 localStorage 中已存的 `ops_chat_session_id`。
 * - 不存在时生成新的 UUID 并写入 localStorage。
 * - localStorage 不可用时（隐私模式/禁写）降级为内存缓存；同页面会话内稳定，
 *   刷新后丢失，不阻塞消息发送。
 */
export function getOrCreateOpsChatSessionId(): string {
  try {
    if (typeof localStorage !== "undefined") {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (existing) return existing;
      const id = generateSessionId();
      localStorage.setItem(STORAGE_KEY, id);
      return id;
    }
  } catch {
    // 忽略 localStorage 异常，走内存降级
  }

  if (!memoryFallback) {
    memoryFallback = generateSessionId();
  }
  return memoryFallback;
}

/**
 * 清除当前 session_id（调试用）。
 */
export function clearOpsChatSessionId(): void {
  memoryFallback = null;
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // 忽略
  }
}
