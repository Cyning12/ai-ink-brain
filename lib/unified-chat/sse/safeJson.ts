/** 解析 SSE `data:` 行 JSON；坏帧返回 null（FP-BAD-SSE） */
export function safeJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}
