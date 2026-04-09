export type TextChunk = {
  content: string;
  chunk_index: number;
};

/**
 * 按“近似字符数”做 512/50 分块（默认）。
 * 注意：这不是 token chunking，但能稳定工作，且可后续替换为 tokenizer 版本。
 */
export function chunkTextByChars(
  text: string,
  opts?: { chunkSize?: number; overlap?: number },
): TextChunk[] {
  const chunkSize = opts?.chunkSize ?? 512;
  const overlap = opts?.overlap ?? 50;
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];

  const step = Math.max(1, chunkSize - overlap);
  const chunks: TextChunk[] = [];
  let idx = 0;

  for (let start = 0; start < cleaned.length; start += step) {
    const end = Math.min(cleaned.length, start + chunkSize);
    const slice = cleaned.slice(start, end).trim();
    if (slice) {
      chunks.push({ content: slice, chunk_index: idx });
      idx += 1;
    }
    if (end >= cleaned.length) break;
  }

  return chunks;
}

