import { BackButton } from "@/app/_components/back-button";
import { Text2SqlChatPanel } from "@/components/Text2SqlChatPanel";

export default function Text2SqlPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight">Text2SQL（查库）</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        专用对话页：请求经{" "}
        <code className="text-xs">/api/py/text2sql/chat</code>，返回为 JSON（非流式）。
      </p>

      <div className="mt-10">
        <Text2SqlChatPanel />
      </div>
    </main>
  );
}

