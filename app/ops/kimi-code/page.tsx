export default function OpsKimiCodeOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
        Kimi Code 总览
      </h1>
      <p className="text-sm leading-relaxed text-[color:var(--color-muted-foreground)]">
        这里是 Ops Desk 总览页占位。P0-4 将接入指标卡片、30 天趋势、数据截至与同步状态。
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "PR Cycle Time", value: "—" },
          { label: "PR Review Time", value: "—" },
          { label: "Issue Throughput", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5"
          >
            <p className="text-xs text-[color:var(--color-muted-foreground)]">{card.label}</p>
            <p className="mt-2 font-serif text-2xl font-semibold text-[color:var(--color-foreground)]">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
