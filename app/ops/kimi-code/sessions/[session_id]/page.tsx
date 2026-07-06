import { redirect } from "next/navigation";

import { OpsSessionDetailClient } from "@/components/ops/OpsSessionDetailClient";
import { isOpsSessionsFeatureEnabled } from "@/lib/ops/sessions-feature";

export default async function OpsKimiCodeSessionDetailPage({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  if (!isOpsSessionsFeatureEnabled()) {
    redirect("/ops/kimi-code");
  }
  const { session_id } = await params;
  return <OpsSessionDetailClient sessionId={session_id} />;
}
