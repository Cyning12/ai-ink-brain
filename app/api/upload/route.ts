import { embedTexts } from "@/lib/ai/siliconflow";
import { insertDocuments } from "@/lib/db/documents";
import { chunkTextByChars } from "@/lib/text/chunk";

export const runtime = "nodejs";

type UploadResult = {
  ok: true;
  filename: string;
  chunks: number;
};

function getFileExt(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

export async function POST(request: Request): Promise<Response> {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { ok: false, error: "Missing form field: file" },
        { status: 400 },
      );
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
      return Response.json(
        { ok: false, error: `Unsupported file type: ${ext || "unknown"}` },
        { status: 415 },
      );
    }

    const chunks = chunkTextByChars(text, { chunkSize: 512, overlap: 50 });
    if (chunks.length === 0) {
      return Response.json(
        { ok: false, error: "No text extracted from file" },
        { status: 400 },
      );
    }

    const vectors = await embedTexts(chunks.map((c) => c.content));

    await insertDocuments(
      chunks.map((c, i) => ({
        content: c.content,
        metadata: {
          filename,
          chunk_index: c.chunk_index,
        },
        embedding: vectors[i]!,
      })),
    );

    const result: UploadResult = {
      ok: true,
      filename,
      chunks: chunks.length,
    };

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

