"use client";

type UnifiedChatUnlockPanelProps = {
  credentialInput: string;
  unlockBusy: boolean;
  unlockError: string | null;
  tokenInputRef: React.RefObject<HTMLInputElement | null>;
  onCredentialChange: (value: string) => void;
  onUnlock: () => void;
};

export function UnifiedChatUnlockPanel({
  credentialInput,
  unlockBusy,
  unlockError,
  tokenInputRef,
  onCredentialChange,
  onUnlock,
}: UnifiedChatUnlockPanelProps) {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-[color:var(--color-border)] bg-white/40 p-4">
      <div className="space-y-2">
        <p className="text-sm leading-relaxed text-slate-700">
          请输入 <strong>ChatBI DB 明文访问令牌</strong>（
          <span className="font-mono">chatbi_access_tokens</span>
          ），点击<strong>解锁</strong>：由 Next BFF 转发{" "}
          <span className="font-mono">GET /api/py/chatbi/access/verify</span> 到 Python 校验；**不**使用{" "}
          <span className="font-mono">NEXT_PUBLIC_ADMIN_SECRET</span>。通过后令牌写入{" "}
          <span className="font-mono">localStorage</span>，后续 Unified / 历史请求均带{" "}
          <span className="font-mono">Authorization: Bearer &lt;明文&gt;</span>（与 Python 约定一致）。
        </p>
        <label className="block text-[11px] text-slate-500">
          访问令牌（明文）
          <input
            ref={tokenInputRef}
            type="password"
            value={credentialInput}
            onChange={(e) => onCredentialChange(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
            placeholder="解锁后请求带 Authorization: Bearer <明文>"
            autoComplete="off"
          />
        </label>
        {unlockError ? (
          <p className="text-[12px] leading-relaxed text-rose-600/90">{unlockError}</p>
        ) : null}
        <button
          type="button"
          disabled={unlockBusy}
          onClick={onUnlock}
          className="w-full rounded-xl bg-[#2c2c2c] px-3 py-2 text-sm text-[#f9f9f7] hover:opacity-90 disabled:opacity-50"
        >
          {unlockBusy ? "校验中…" : "解锁"}
        </button>
      </div>
    </section>
  );
}
