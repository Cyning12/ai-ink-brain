/** Portfolio Unified Chat 档位（由 ChatBI access_level 映射） */

export type PortfolioChatTier = "visitor" | "visitor-admin";

/** L2 → visitor；L0/L1 → visitor-admin；其他 → 保守 visitor（F5） */
export function resolvePortfolioChatTier(accessLevel: number | null | undefined): PortfolioChatTier {
  if (accessLevel === 0 || accessLevel === 1) return "visitor-admin";
  return "visitor";
}

export function portfolioTimelineVisible(tier: PortfolioChatTier): boolean {
  return tier === "visitor-admin";
}

export function portfolioDebugUrlAllowed(tier: PortfolioChatTier): boolean {
  return tier === "visitor-admin";
}

/** portfolio 两档均不展示 Router Debug（SPEC §4.4） */
export function portfolioRouterDebugVisible(): boolean {
  return false;
}
