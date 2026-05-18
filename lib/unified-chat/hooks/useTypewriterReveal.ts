"use client";

import { useEffect, useRef, useState } from "react";

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

/**
 * 将单调增长的 target 以打字机速度展示；流结束（active=false）时对齐全文。
 */
export function useTypewriterReveal(
  target: string,
  options: UseTypewriterRevealOptions,
): string {
  const { active, charsPerTick = 2, tickMs = 20 } = options;
  const [visibleLen, setVisibleLen] = useState(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    if (target.length < visibleLen) {
      setVisibleLen(0);
    }
  }, [target, visibleLen]);

  useEffect(() => {
    if (!active) {
      setVisibleLen(target.length);
      return;
    }

    const id = window.setInterval(() => {
      setVisibleLen((prev) =>
        nextTypewriterVisibleLen(prev, targetRef.current.length, charsPerTick),
      );
    }, tickMs);

    return () => window.clearInterval(id);
  }, [active, target, charsPerTick, tickMs]);

  return target.slice(0, visibleLen);
}
