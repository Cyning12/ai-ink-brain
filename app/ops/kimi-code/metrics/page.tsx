import { Suspense } from "react";

import { OpsMetricsSummary } from "@/components/ops/ops-metrics-summary";

export const dynamic = "force-dynamic";

export default function OpsKimiCodeMetricsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-background)] p-8 text-center text-sm text-[color:var(--color-muted-foreground)]">
          加载 Metrics 页…
        </div>
      }
    >
      <OpsMetricsSummary />
    </Suspense>
  );
}
