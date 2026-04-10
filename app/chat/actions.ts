"use server";

import { getAdminApiSecret } from "@/lib/auth/admin-env";
import type { ChatMessage } from "@/lib/types/chat";
import { getRequestOrigin } from "@/lib/url/request-origin";

export async function sendChatViaApi(input: {
  messages: ChatMessage[];
  useRag?: boolean;
}): Promise<{ role: "assistant"; content: string }> {
  const secret = getAdminApiSecret();
  if (!secret) {
    throw new Error(
      "服务端未配置 NEXT_PUBLIC_ADMIN_SECRET（或兼容 CHAT_API_SECRET）",
    );
  }

  const origin = await getRequestOrigin();
  const res = await fetch(`${origin}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      messages: input.messages,
      useRag: input.useRag ?? true,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Chat API error: ${res.status}`);
  }

  const json = (await res.json()) as {
    ok?: boolean;
    message?: { role: "assistant"; content: string };
  };

  if (!json.message?.content) {
    throw new Error("Chat API returned empty message");
  }

  return json.message;
}
