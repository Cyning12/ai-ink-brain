import { BackButton } from "@/app/_components/back-button";
import { UnifiedChatPageClient } from "@/components/unified-chat/UnifiedChatPageClient";

export default function UnifiedChatPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <div className="text-right">
          <h1 className="text-2xl font-semibold tracking-tight">Unified Chat（v1）</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            RAG + Text2SQL + Timeline（一次性 JSON events）
          </p>
        </div>
      </div>

      <div className="mt-8">
        <UnifiedChatPageClient />
      </div>
    </main>
  );
}

