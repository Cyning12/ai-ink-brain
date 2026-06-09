"use client";

import type { RefObject } from "react";

import { PORTFOLIO_ALL_DEMO_CHIPS } from "@/lib/unified-chat/portfolio-demo-chips";

type UnifiedChatUnlockSectionProps = {
  portfolio: boolean;
  credentialInput: string;
  onCredentialChange: (value: string) => void;
  unlockError: string | null;
  onClearUnlockError: () => void;
  unlockBusy: boolean;
  onUnlock: () => void;
  tokenInputRef: RefObject<HTMLInputElement | null>;
  draft: string;
  onDraftChange: (value: string) => void;
};

/** 未解锁时的 token 输入与 portfolio 演示 chip 预览 */
export function UnifiedChatUnlockSection({
  portfolio,
  credentialInput,
  onCredentialChange,
  unlockError,
  onClearUnlockError,
  unlockBusy,
  onUnlock,
  tokenInputRef,
  draft,
  onDraftChange,
}: UnifiedChatUnlockSectionProps) {
  return (
    <section className="mx-auto max-w-lg rounded-2xl border border-[color:var(--color-border)] bg-white/40 p-4">
      <div className="space-y-2">
        <p className="text-sm leading-relaxed text-slate-700">
          {portfolio ? (
            <>
              RAG 对话需 <strong>邮件申请临时访问令牌</strong>（
              <a href="mailto:231127227@qq.com" className="underline underline-offset-2">
                231127227@qq.com
              </a>
              ）。邮件将返回带有效期的 ChatBI 明文 token；在此输入并解锁后，对话与历史请求均走
              Python 校验。
            </>
          ) : (
            <>
              请输入 <strong>ChatBI DB 明文访问令牌</strong>（
              <span className="font-mono">chatbi_access_tokens</span>
              ），点击<strong>解锁</strong>：由 Next BFF 转发{" "}
              <span className="font-mono">GET /api/py/chatbi/access/verify</span>{" "}
              到 Python 校验；**不**使用{" "}
              <span className="font-mono">NEXT_PUBLIC_ADMIN_SECRET</span>
              。
            </>
          )}
          通过后令牌写入 <span className="font-mono">localStorage</span>，后续对话与历史请求均带{" "}
          <span className="font-mono">Authorization: Bearer &lt;明文&gt;</span>。
        </p>
        <label className="block text-[11px] text-slate-500">
          {portfolio ? "演示访问令牌（明文）" : "访问令牌（明文）"}
          <input
            ref={tokenInputRef}
            type="password"
            value={credentialInput}
            onChange={(e) => {
              onCredentialChange(e.target.value);
              onClearUnlockError();
            }}
            className="mt-1 w-full rounded-xl border border-[color:var(--color-border)] bg-white/70 px-3 py-2 text-sm text-[#2c2c2c] outline-none focus:border-slate-400"
            placeholder={
              portfolio
                ? "邮件收到的 ChatBI 明文 token"
                : "解锁后请求带 Authorization: Bearer <明文>"
            }
            autoComplete="off"
          />
        </label>
        {unlockError ? (
          <p className="text-[12px] leading-relaxed text-rose-600/90">{unlockError}</p>
        ) : null}
        <button
          type="button"
          disabled={unlockBusy}
          onClick={() => void onUnlock()}
          className="w-full rounded-xl bg-[#2c2c2c] px-3 py-2 text-sm text-[#f9f9f7] hover:opacity-90 disabled:opacity-50"
        >
          {unlockBusy ? "校验中…" : "解锁"}
        </button>
        {portfolio ? (
          <div className="space-y-2 border-t border-[color:var(--color-border)] pt-3">
            <div className="text-[11px] text-slate-500">推荐问法（解锁后可发送）</div>
            <div className="flex flex-wrap gap-2">
              {PORTFOLIO_ALL_DEMO_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => onDraftChange(chip.label)}
                  className="rounded-full border border-[color:var(--color-border)] bg-[#f9f9f7] px-3 py-1.5 text-[11px] text-slate-700 hover:bg-white/70"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            {draft.trim() ? (
              <textarea
                readOnly
                value={draft}
                rows={2}
                className="w-full resize-none rounded-xl border border-dashed border-[color:var(--color-border)] bg-white/50 px-3 py-2 text-sm text-slate-600"
                placeholder="点击上方 chip 可预览问题…"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
