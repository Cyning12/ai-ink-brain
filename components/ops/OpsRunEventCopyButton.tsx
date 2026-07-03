"use client";

import { useCallback, useState } from "react";

type OpsRunEventCopyButtonProps = {
  text: string;
  label?: string;
  className?: string;
};

/** 复制运行事件 JSON · 人验落盘用 */
export function OpsRunEventCopyButton({
  text,
  label = "复制",
  className = "",
}: OpsRunEventCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // 降级：旧浏览器或无 clipboard 权限时静默失败
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`shrink-0 rounded border border-slate-200/90 bg-white/90 px-2 py-0.5 text-[10px] text-slate-600 hover:border-slate-300 hover:text-slate-900 ${className}`}
      aria-label={copied ? "已复制" : label}
    >
      {copied ? "已复制" : label}
    </button>
  );
}
