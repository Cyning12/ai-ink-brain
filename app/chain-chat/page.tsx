import { BackButton } from "@/app/_components/back-button";
import { ChainChatPageClient } from "@/components/chain-chat/ChainChatPageClient";

export default function ChainChatPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <div className="text-right">
          <h1 className="text-2xl font-semibold tracking-tight">Chain Chat（v1）</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            时间线展示工具调用 + SQL/图表（不影响现有 /chat）
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ChainChatPageClient />
      </div>
    </main>
  );
}

