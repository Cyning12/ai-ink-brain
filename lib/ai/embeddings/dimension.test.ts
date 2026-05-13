import { afterEach, describe, expect, it, vi } from "vitest";

import { getExpectedEmbeddingDimension } from "@/lib/ai/embeddings/dimension";

describe("getExpectedEmbeddingDimension", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 1024 when env is unset", () => {
    vi.stubEnv("EMBEDDING_DIM", undefined);
    vi.stubEnv("SILICONFLOW_EMBEDDING_DIM", undefined);
    expect(getExpectedEmbeddingDimension()).toBe(1024);
  });

  it("prefers EMBEDDING_DIM over SILICONFLOW_EMBEDDING_DIM", () => {
    vi.stubEnv("EMBEDDING_DIM", "768");
    vi.stubEnv("SILICONFLOW_EMBEDDING_DIM", "1024");
    expect(getExpectedEmbeddingDimension()).toBe(768);
  });

  it("falls back to 1024 for invalid numeric strings", () => {
    vi.stubEnv("EMBEDDING_DIM", "not-a-number");
    expect(getExpectedEmbeddingDimension()).toBe(1024);
  });
});
