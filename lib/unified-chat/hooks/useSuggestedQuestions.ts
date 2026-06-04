"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getDefaultSuggestedQuestions,
  type SuggestedQuestionsMode,
} from "@/lib/unified-chat/suggestedQuestionsDefaults";
import {
  loadSuggestedQuestionsOnce,
  peekSuggestedQuestionsSessionCache,
} from "@/lib/unified-chat/suggestedQuestionsApi";

export type UseSuggestedQuestionsArgs = {
  /** 解锁后为 true；未启用时展示静态默认列表 */
  enabled: boolean;
  mode: SuggestedQuestionsMode;
  headers?: Record<string, string>;
};

export function useSuggestedQuestions(args: UseSuggestedQuestionsArgs): {
  chips: string[];
  loading: boolean;
} {
  const defaults = useMemo(
    () => getDefaultSuggestedQuestions(args.mode),
    [args.mode],
  );

  const [remoteChips, setRemoteChips] = useState<string[] | null>(() =>
    peekSuggestedQuestionsSessionCache(),
  );
  const [loading, setLoading] = useState(false);

  const chips = args.enabled ? (remoteChips ?? defaults) : defaults;

  useEffect(() => {
    if (!args.enabled) return;
    if (remoteChips) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 解锁后须发起一次推荐问法拉取
    setLoading(true);

    void loadSuggestedQuestionsOnce({
      mode: args.mode,
      headers: args.headers,
    }).then((list) => {
      if (!cancelled) {
        setRemoteChips(list);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [args.enabled, args.mode, args.headers, remoteChips]);

  return {
    chips,
    loading: args.enabled && loading && !remoteChips,
  };
}
