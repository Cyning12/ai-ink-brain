export function formatDurationDays(
  days: number | null | undefined,
  fallback = "—",
): string {
  if (days === null || days === undefined || Number.isNaN(days)) return fallback;
  if (days < 1) {
    const hours = days * 24;
    if (hours < 1) {
      const minutes = hours * 60;
      return `${Math.round(minutes)} 分钟`;
    }
    return `${Math.round(hours)} 小时`;
  }
  if (days < 10) return `${days.toFixed(1)} 天`;
  return `${Math.round(days)} 天`;
}

export function formatDateTime(
  iso: string | null | undefined,
  fallback = "—",
): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(
  iso: string | null | undefined,
  fallback = "—",
): string {
  if (!iso) return fallback;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
