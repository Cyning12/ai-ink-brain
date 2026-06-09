"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  readChatbiToken,
  requestChatbiAccessVerify,
  writeChatbiToken,
} from "@/lib/chatbi-client";
import { buildChatbiBearerHeaders } from "@/lib/chat/buildChatAuthHeaders";

/** ChatBI 假登录：localStorage 明文 token + 解锁表单状态 */
export function useUnifiedChatCredential() {
  const [mounted, setMounted] = useState(false);
  const [credentialInput, setCredentialInput] = useState("");
  const [chatbiToken, setChatbiToken] = useState("");
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const tokenInputRef = useRef<HTMLInputElement | null>(null);

  const locked = !chatbiToken.trim();

  useEffect(() => {
    setMounted(true);
    setChatbiToken(readChatbiToken());
  }, []);

  useEffect(() => {
    if (mounted && locked) tokenInputRef.current?.focus();
  }, [mounted, locked]);

  const headers: Record<string, string> = useMemo(
    () => buildChatbiBearerHeaders(chatbiToken),
    [chatbiToken],
  );

  const handleUnlock = useCallback(async () => {
    setUnlockError(null);
    const v = credentialInput.trim();
    if (!v) {
      setUnlockError("请输入 ChatBI 明文 token");
      return;
    }
    const plain = v.replace(/^bearer\s+/i, "").trim();
    if (!plain) {
      setUnlockError("请输入有效的 ChatBI 明文 token");
      return;
    }
    setUnlockBusy(true);
    try {
      const gate = await requestChatbiAccessVerify({ plain });
      if (!gate.ok) {
        setUnlockError(gate.message);
        return;
      }
      writeChatbiToken(plain);
      setChatbiToken(plain);
      setCredentialInput("");
    } finally {
      setUnlockBusy(false);
    }
  }, [credentialInput]);

  return {
    mounted,
    locked,
    chatbiToken,
    credentialInput,
    setCredentialInput,
    setUnlockError,
    unlockBusy,
    unlockError,
    tokenInputRef,
    headers,
    handleUnlock,
  };
}
