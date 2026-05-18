"use client";

import { useEffect, useState } from "react";

export type UseTypewriterRevealOptions = {
  /** 为 true 时按 tick 揭开；为 false 时立即展示全文 */
  active: boolean;
  /** 每个 tick 增加的字符数 */
  charsPerTick?: number;
  /** tick 间隔（毫秒） */
  tickMs?: number;
};

/** 单步揭开长度（供单测） */
export function nextTypewriterVisibleLen(
  prev: number,
  targetLen: number,
  charsPerTick: number,
): number {
  if (prev >= targetLen) return prev;
  return Math.min(targetLen, prev + charsPerTick);
}

/** 目标变短（新一轮）时从 0 重新揭开 */
export function nextTypewriterVisibleLenWithReset(
  prev: number,
  targetLen: number,
  charsPerTick: number,
): number {
  const base = targetLen < prev ? 0 : prev;
  return nextTypewriterVisibleLen(base, targetLen, charsPerTick);
}

/**
 * 将单调增长的 target 以打字机速度展示；流结束（active=false）时对齐全文。
 */
export function useTypewriterReveal(
  target: string,
  options: UseTypewriterRevealOptions,
): string {
  const { active, charsPerTick = 2, tickMs = 20 } = options;
  const [visibleLen, setVisibleLen] = useState(0);

  useEffect(() => {
    if (!active) return;

    const id = window.setInterval(() => {
      setVisibleLen((prev) =>
        nextTypewriterVisibleLenWithReset(prev, target.length, charsPerTick),
      );
    }, tickMs);

    return () => window.clearInterval(id);
  }, [active, target, charsPerTick, tickMs]);

  if (!active) {
    return target;
  }

  return target.slice(0, visibleLen);
}
