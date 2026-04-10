import { ChatPanel } from "@/app/chat/chat-panel";
import { BackButton } from "@/app/_components/back-button";

export default function ChatPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight">Chat</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        独立对话页：当前为占位逻辑（RAG 检索 + 后续流式 LLM）。接口层使用{" "}
        <code className="text-xs">/api/chat</code> 并强制 Bearer 校验。
      </p>

      <div className="mt-10">
        <ChatPanel />
      </div>
    </main>
  );
}
