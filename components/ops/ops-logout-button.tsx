"use client";

import { useRouter } from "next/navigation";

export function OpsLogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/ops/logout", { method: "POST", credentials: "include" });
    router.replace("/ops/login");
  }

  return (
    <button
      onClick={() => void logout()}
      className="text-xs text-[color:var(--color-muted-foreground)] underline-offset-4 hover:text-[color:var(--color-foreground)] hover:underline"
      type="button"
    >
      退出
    </button>
  );
}
