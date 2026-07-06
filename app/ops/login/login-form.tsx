"use client";

type LoginFormProps = {
  sessionExpired: boolean;
  loginError: boolean;
  demoToken: string;
};

export function LoginForm({
  sessionExpired,
  loginError,
  demoToken,
}: LoginFormProps) {
  return (
    <form
      method="POST"
      action="/api/ops/login"
      className="mx-auto w-full max-w-sm rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-8 shadow-sm"
    >
      <input type="hidden" name="redirect" value="/ops/kimi-code" />

      <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
        Ops Desk
      </h1>
      <p className="mt-2 text-sm text-[color:var(--color-muted-foreground)]">
        请输入邀请密钥以进入 Kimi Code 看板
      </p>

      {sessionExpired && (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          登录已过期，请重新登录
        </p>
      )}

      {loginError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          登录失败，请检查邀请密钥
        </p>
      )}

      <div className="mt-6 space-y-4">
        <label className="block text-sm text-[color:var(--color-muted-foreground)]">
          邀请密钥
          <input
            type="password"
            name="token"
            defaultValue={demoToken}
            placeholder="邀请密钥"
            className="mt-1 block w-full rounded-lg border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-foreground)] outline-none focus:ring-2 focus:ring-[color:var(--color-ring)]"
            required
            autoFocus
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-[color:var(--color-foreground)] px-4 py-2 text-sm font-medium text-[color:var(--color-background)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          进入
        </button>
      </div>
    </form>
  );
}
