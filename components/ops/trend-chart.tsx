import type { TrendPoint } from "@/lib/ops/data";

export function TrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) return null;

  const width = 600;
  const height = 160;
  const pad = { top: 12, right: 12, bottom: 28, left: 28 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d.closedIssues, d.mergedPrs)),
  );

  const xFor = (i: number) => pad.left + (i / (data.length - 1)) * chartW;
  const yFor = (v: number) => pad.top + chartH - (v / maxValue) * chartH;

  const issuesPoints = data
    .map((d, i) => `${xFor(i)},${yFor(d.closedIssues)}`)
    .join(" ");
  const prsPoints = data
    .map((d, i) => `${xFor(i)},${yFor(d.mergedPrs)}`)
    .join(" ");

  const xTicks = [0, Math.floor((data.length - 1) / 2), data.length - 1];

  return (
    <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-5">
      <h2 className="font-serif text-lg font-semibold text-[color:var(--color-foreground)]">
        近 30 天趋势
      </h2>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[320px]"
          role="img"
          aria-label="近 30 天 closed issues 与 merged PRs 趋势"
        >
          <g>
            {/* grid lines */}
            {[0, 0.5, 1].map((ratio) => {
              const y = pad.top + chartH - ratio * chartH;
              return (
                <line
                  key={ratio}
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                  strokeDasharray={ratio === 0 ? undefined : "2 2"}
                />
              );
            })}

            {/* closed issues line */}
            <polyline
              fill="none"
              stroke="var(--color-foreground)"
              strokeWidth={2}
              points={issuesPoints}
              opacity={0.8}
            />
            {data.map((d, i) => (
              <circle
                key={`i-${d.date}`}
                cx={xFor(i)}
                cy={yFor(d.closedIssues)}
                r={2.5}
                fill="var(--color-foreground)"
              />
            ))}

            {/* merged PRs line */}
            <polyline
              fill="none"
              stroke="var(--color-muted-foreground)"
              strokeWidth={2}
              strokeDasharray="4 4"
              points={prsPoints}
              opacity={0.8}
            />
            {data.map((d, i) => (
              <circle
                key={`p-${d.date}`}
                cx={xFor(i)}
                cy={yFor(d.mergedPrs)}
                r={2.5}
                fill="var(--color-muted-foreground)"
              />
            ))}

            {/* x-axis labels */}
            {xTicks.map((i) => (
              <text
                key={`t-${i}`}
                x={xFor(i)}
                y={height - 6}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-muted-foreground)"
              >
                {formatMonthDay(data[i].date)}
              </text>
            ))}
          </g>
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-[color:var(--color-muted-foreground)]">
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-[color:var(--color-foreground)]" />
          Closed Issues
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t border-dashed border-[color:var(--color-muted-foreground)]" />
          Merged PRs
        </div>
      </div>
    </div>
  );
}

function formatMonthDay(isoDate: string): string {
  const d = new Date(isoDate);
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${m}/${day}`;
}
