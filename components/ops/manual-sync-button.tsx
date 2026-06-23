"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function ManualSyncButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const triggerSync = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/ops/sync/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const body = await res.json().catch(() => ({ ok: false, error: "未知错误" }));

      if (res.ok) {
        setMessage("同步已触发");
        router.refresh();
      } else if (res.status === 409) {
        setMessage("同步进行中，请稍后再试");
      } else if (res.status === 503) {
        setMessage("服务端未配置 dispatch，请联系维护者");
      } else {
        setMessage(body.error || `请求失败 (${res.status})`);
      }
    } catch {
      setMessage("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={triggerSync}
        disabled={disabled || loading}
        className={[
          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          disabled || loading
            ? "cursor-not-allowed bg-slate-200 text-slate-500"
            : "bg-[color:var(--color-foreground)] text-[color:var(--color-background)] hover:opacity-90",
        ].join(" ")}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "触发中…" : "立即同步"}
      </button>
      {message && (
        <span
          className={[
            "text-sm",
            message === "同步已触发"
              ? "text-emerald-600"
              : "text-amber-600",
          ].join(" ")}
        >
          {message}
        </span>
      )}
    </div>
  );
}
