import { BackButton } from "@/app/_components/back-button";
import ChatPanel from "@/components/ChatPanel";

export default function ChatPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight">Chat</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        独立对话页：支持历史恢复与流式输出（经{" "}
        <code className="text-xs">/api/py/chat</code>）。
      </p>

      <div className="mt-10">
        <ChatPanel sessionScope="floating" />
      </div>
    </main>
  );
}
