"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SyncRun, SyncRunListItem } from "@/lib/ops/data";
import { ManualSyncButton } from "@/components/ops/manual-sync-button";
import { SyncRunHistory } from "@/components/ops/sync-run-history";
import { SyncStatus } from "@/components/ops/sync-status";

const POLL_MS = 5000;
const POLL_TIMEOUT_MS = 120_000;

type SyncPanelContextValue = {
  runs: SyncRunListItem[];
  syncInProgress: boolean;
  displayStatus: SyncRun["status"] | "none";
  displayAsOf: string | null;
  displaySyncRun: SyncRun | null;
  onTriggered: () => void;
};

const SyncPanelContext = createContext<SyncPanelContextValue | null>(null);

function useSyncPanel(): SyncPanelContextValue {
  const ctx = useContext(SyncPanelContext);
  if (!ctx) {
    throw new Error("SyncPanel 组件须在 SyncPanelProvider 内使用");
  }
  return ctx;
}

function isActiveRun(status: SyncRunListItem["status"]): boolean {
  return status === "pending" || status === "running";
}

function hasActiveSyncRun(runs: SyncRunListItem[]): boolean {
  return runs.some((r) => isActiveRun(r.status));
}

function buildOptimisticRun(): SyncRunListItem {
  return {
    id: "__optimistic__",
    started_at: new Date().toISOString(),
    finished_at: null,
    status: "running",
    trigger: "manual",
    records_issue: 0,
    records_pr: 0,
    error_message: null,
    has_graph_snapshot: false,
    has_scan_snapshot: false,
  };
}

function toSyncRun(
  item: SyncRunListItem,
  repoId: string,
): SyncRun {
  return {
    id: item.id,
    repo_id: repoId,
    started_at: item.started_at,
    finished_at: item.finished_at,
    status: item.status,
    cursor: null,
    records_issue: item.records_issue,
    records_pr: item.records_pr,
    error_message: item.error_message,
    trigger: item.trigger,
  };
}

export function SyncPanelProvider({
  initialRuns,
  initialSyncStatus,
  initialSyncRun,
  initialAsOf,
  children,
}: {
  initialRuns: SyncRunListItem[];
  initialSyncStatus: SyncRun["status"] | "none";
  initialSyncRun: SyncRun | null;
  initialAsOf: string | null;
  children: ReactNode;
}) {
  const [runs, setRuns] = useState(initialRuns);
  const [awaitingRun, setAwaitingRun] = useState(false);
  const pollUntilRef = useRef<number | null>(null);
  const repoId = initialSyncRun?.repo_id ?? "";

  const syncInProgress = useMemo(
    () => awaitingRun || hasActiveSyncRun(runs),
    [awaitingRun, runs],
  );

  const displayRuns = useMemo(() => {
    if (!awaitingRun || hasActiveSyncRun(runs)) {
      return runs;
    }
    return [buildOptimisticRun(), ...runs];
  }, [awaitingRun, runs]);

  const latestRun = displayRuns[0] ?? null;
  const displayStatus: SyncRun["status"] | "none" = syncInProgress
    ? latestRun?.status === "pending"
      ? "pending"
      : "running"
    : initialSyncStatus === "none" && latestRun
      ? latestRun.status
      : initialSyncStatus;

  const displayAsOf =
    latestRun?.finished_at ?? latestRun?.started_at ?? initialAsOf;

  const displaySyncRun = latestRun
    ? toSyncRun(latestRun, repoId)
    : initialSyncRun;

  const fetchRuns = useCallback(async (): Promise<SyncRunListItem[] | null> => {
    try {
      const res = await fetch("/api/ops/sync/runs?limit=10");
      if (!res.ok) return null;
      const body = (await res.json()) as { runs?: SyncRunListItem[] };
      return body.runs ?? [];
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setRuns(initialRuns);
  }, [initialRuns]);

  useEffect(() => {
    if (!syncInProgress) {
      pollUntilRef.current = null;
      return;
    }

    if (pollUntilRef.current === null) {
      pollUntilRef.current = Date.now() + POLL_TIMEOUT_MS;
    }

    let cancelled = false;

    const tick = async () => {
      const next = await fetchRuns();
      if (cancelled || !next) return;
      setRuns(next);
      if (hasActiveSyncRun(next)) {
        setAwaitingRun(false);
      } else if (pollUntilRef.current && Date.now() >= pollUntilRef.current) {
        setAwaitingRun(false);
      }
    };

    void tick();
    const id = window.setInterval(() => {
      void tick();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [syncInProgress, fetchRuns]);

  const onTriggered = useCallback(() => {
    setAwaitingRun(true);
    pollUntilRef.current = Date.now() + POLL_TIMEOUT_MS;
  }, []);

  const value = useMemo(
    () => ({
      runs: displayRuns,
      syncInProgress,
      displayStatus,
      displayAsOf,
      displaySyncRun,
      onTriggered,
    }),
    [
      displayRuns,
      syncInProgress,
      displayStatus,
      displayAsOf,
      displaySyncRun,
      onTriggered,
    ],
  );

  return (
    <SyncPanelContext.Provider value={value}>{children}</SyncPanelContext.Provider>
  );
}

export function SyncControls({ isMaintainer }: { isMaintainer: boolean }) {
  const { syncInProgress, displayStatus, displaySyncRun, displayAsOf, onTriggered } =
    useSyncPanel();

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SyncStatus
          status={displayStatus}
          syncRun={displaySyncRun}
          asOf={displayAsOf}
        />
        {isMaintainer && (
          <ManualSyncButton disabled={syncInProgress} onTriggered={onTriggered} />
        )}
      </div>
      {syncInProgress && (
        <p className="text-sm text-blue-700">
          同步进行中（GitHub Actions）· 历史表将在任务写入数据库后自动刷新，通常需 1–2 分钟
        </p>
      )}
    </div>
  );
}

export function SyncRunHistoryLive() {
  const { runs } = useSyncPanel();
  return <SyncRunHistory runs={runs} />;
}
