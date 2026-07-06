import { redirect } from "next/navigation";

import { OpsSessionsClient } from "@/components/ops/OpsSessionsClient";
import { isOpsSessionsFeatureEnabled } from "@/lib/ops/sessions-feature";

export default function OpsKimiCodeSessionsPage() {
  if (!isOpsSessionsFeatureEnabled()) {
    redirect("/ops/kimi-code");
  }
  return <OpsSessionsClient />;
}
