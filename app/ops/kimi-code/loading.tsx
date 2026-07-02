export default function OpsKimiCodeLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="加载总览">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-[color:var(--color-wash)]" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-wash)]/60"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-wash)]/40" />
      <p className="text-center text-sm text-[color:var(--color-muted-foreground)]">正在加载总览…</p>
    </div>
  );
}
