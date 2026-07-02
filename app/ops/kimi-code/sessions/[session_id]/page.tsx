import { OpsSessionDetailClient } from "@/components/ops/OpsSessionDetailClient";

export default async function OpsKimiCodeSessionDetailPage({
  params,
}: {
  params: Promise<{ session_id: string }>;
}) {
  const { session_id } = await params;
  return <OpsSessionDetailClient sessionId={session_id} />;
}
