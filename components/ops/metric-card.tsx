export function MetricCard({
  label,
  value,
  subtext,
}: {
  label: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5">
      <p className="text-xs text-[color:var(--color-muted-foreground)]">{label}</p>
      <p className="mt-2 font-serif text-2xl font-semibold text-[color:var(--color-foreground)]">
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-[color:var(--color-muted-foreground)]">
          {subtext}
        </p>
      )}
    </div>
  );
}
