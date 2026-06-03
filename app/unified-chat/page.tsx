import { BackButton } from "@/app/_components/back-button";
import { UnifiedChatPageClient } from "@/components/unified-chat/UnifiedChatPageClient";
import { getSiteMode } from "@/lib/site-mode";

export default function UnifiedChatPage() {
  const portfolio = getSiteMode() === "portfolio";

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <div className="text-right">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#2C2C2C]">
            {portfolio ? "RAG 演示对话" : "统一对话"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {portfolio
              ? "流式 RAG + Timeline · 发消息需邮件申请临时秘钥"
              : "RAG + Text2SQL + Timeline（流式 SSE）"}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <UnifiedChatPageClient />
      </div>
    </main>
  );
}
