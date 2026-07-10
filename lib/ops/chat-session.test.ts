import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "ops_chat_session_id";

function createMockStorage(): Storage {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
  } as unknown as Storage;
}

describe("getOrCreateOpsChatSessionId", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("localStorage", createMockStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("首次调用生成新 id 并存入 localStorage", async () => {
    const { getOrCreateOpsChatSessionId } = await import("@/lib/ops/chat-session");
    const id = getOrCreateOpsChatSessionId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(id);
  });

  it("重复调用返回同一 id", async () => {
    const { getOrCreateOpsChatSessionId } = await import("@/lib/ops/chat-session");
    const first = getOrCreateOpsChatSessionId();
    const second = getOrCreateOpsChatSessionId();
    expect(second).toBe(first);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(first);
  });

  it("读取已存在的 localStorage 值", async () => {
    const { getOrCreateOpsChatSessionId } = await import("@/lib/ops/chat-session");
    localStorage.setItem(STORAGE_KEY, "existing-session-id");
    const id = getOrCreateOpsChatSessionId();
    expect(id).toBe("existing-session-id");
  });

  it("localStorage 不可用时降级内存 id 并保持同页稳定", async () => {
    const failingStorage = {
      getItem: vi.fn(() => {
        throw new Error("private mode");
      }),
      setItem: vi.fn(() => {
        throw new Error("private mode");
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as unknown as Storage;

    vi.stubGlobal("localStorage", failingStorage);

    const { getOrCreateOpsChatSessionId } = await import("@/lib/ops/chat-session");
    const first = getOrCreateOpsChatSessionId();
    const second = getOrCreateOpsChatSessionId();
    expect(second).toBe(first);
    expect(failingStorage.getItem).toHaveBeenCalled();
  });

  it("localStorage 不可用时不同 import 会话各自生成新 id（符合刷新丢失）", async () => {
    const failingStorage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("quota exceeded");
      }),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    } as unknown as Storage;
    vi.stubGlobal("localStorage", failingStorage);

    const { getOrCreateOpsChatSessionId: firstFn } = await import("@/lib/ops/chat-session");
    const id1 = firstFn();
    vi.resetModules();
    const { getOrCreateOpsChatSessionId: secondFn } = await import("@/lib/ops/chat-session");
    const id2 = secondFn();
    expect(typeof id2).toBe("string");
    expect(id2).not.toBe(id1);
    expect(failingStorage.setItem).toHaveBeenCalled();
  });
});
