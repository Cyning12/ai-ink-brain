import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DocumentMetadata = {
  filename: string;
  original_link?: string;
  page_number?: number;
  section_header?: string;
  chunk_index?: number;
};

export type InsertDocumentRow = {
  content: string;
  metadata: DocumentMetadata;
  embedding: number[];
};

export async function insertDocuments(rows: InsertDocumentRow[]) {
  const supabase = createSupabaseServerClient();

  const payload = rows.map((r) => ({
    content: r.content,
    metadata: r.metadata as unknown as Record<string, unknown>,
    embedding: r.embedding,
  }));

  const { error } = await supabase.from("documents").insert(payload);
  if (error) {
    throw new Error(`Failed to insert documents: ${error.message}`);
  }
}

