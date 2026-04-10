import { embedTexts } from "@/lib/siliconflow";
import { insertDocuments } from "@/lib/db/documents";
import { chunkTextByChars } from "@/lib/text/chunk";

export type IngestFileResult = {
  ok: true;
  filename: string;
  chunks: number;
};

function getFileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function readOptionalString(form: FormData, key: string): string | undefined {
  const v = form.get(key);
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

/**
 * 接收 multipart/form-data：file（必填），original_link（可选）。
 * 支持：pdf / md / mdx / txt
 */
export async function processUploadedFile(
  request: Request,
): Promise<IngestFileResult> {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    throw new Error("Missing form field: file");
  }

  const filename = file.name || "upload";
  const ext = getFileExt(filename);
  const ab = await file.arrayBuffer();
  const buf = Buffer.from(ab);

  let text = "";
  if (ext === "pdf") {
    const mod = await import("pdf-parse");
    type PdfParseFn = (input: Buffer) => Promise<{ text?: string }>;
    const pdfParse = (("default" in mod ? mod.default : mod) as unknown) as PdfParseFn;
    const parsed = await pdfParse(buf);
    text = parsed.text ?? "";
  } else if (ext === "md" || ext === "mdx" || ext === "txt") {
    text = buf.toString("utf-8");
  } else {
    throw new Error(`Unsupported file type: ${ext || "unknown"}`);
  }

  const original_link = readOptionalString(form, "original_link");

  const chunks = chunkTextByChars(text, { chunkSize: 512, overlap: 50 });
  if (chunks.length === 0) {
    throw new Error("No text extracted from file");
  }

  const vectors = await embedTexts(chunks.map((c) => c.content));

  await insertDocuments(
    chunks.map((c, i) => ({
      content: c.content,
      metadata: {
        filename,
        original_link,
        chunk_index: c.chunk_index,
      },
      embedding: vectors[i]!,
    })),
  );

  return { ok: true, filename, chunks: chunks.length };
}
