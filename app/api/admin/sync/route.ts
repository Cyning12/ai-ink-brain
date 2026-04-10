import { randomUUID } from "node:crypto";

import { syncContentToVector, type SyncContentToVectorResult } from "@/lib/ingest";

export const runtime = "nodejs";

type JobStatus = "queued" | "running" | "succeeded" | "failed";

type SyncJob = {
  id: string;
  status: JobStatus;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  result: SyncContentToVectorResult | null;
  error: string | null;
};

/**
 * 轻量内存任务队列（适合本地/单实例）。
 * 注意：Serverless/多实例下可能丢失或不一致；若需要强一致进度，请落库或用队列系统。
 */
const JOBS: Map<string, SyncJob> = new Map();

function deny(status: number) {
  return Response.json({ ok: false, error: "Forbidden" }, { status });
}

function requireAdminToken(request: Request): Response | null {
  const expected = process.env.NEXT_PUBLIC_ADMIN_SECRET?.trim();
  if (!expected) {
    return Response.json(
      { ok: false, error: "服务端未配置环境变量 NEXT_PUBLIC_ADMIN_SECRET" },
      { status: 500 },
    );
  }

  const token = request.headers.get("x-admin-token")?.trim() ?? "";
  if (token !== expected) return deny(403);
  return null;
}

function getJobPublicView(job: SyncJob) {
  return {
    id: job.id,
    status: job.status,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    result: job.result,
    error: job.error,
  };
}

async function runJob(jobId: string) {
  const job = JOBS.get(jobId);
  if (!job) return;
  job.status = "running";
  job.startedAt = new Date().toISOString();

  try {
    const result = await syncContentToVector();
    job.status = "succeeded";
    job.result = result;
  } catch (err) {
    job.status = "failed";
    job.error = err instanceof Error ? err.message : "Unknown error";
  } finally {
    job.finishedAt = new Date().toISOString();
  }
}

/**
 * 触发：POST /api/admin/sync
 * - Header: x-admin-token: <NEXT_PUBLIC_ADMIN_SECRET>
 * 返回：202 + jobId（可用 GET 查询进度）
 */
export async function POST(request: Request): Promise<Response> {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const id = randomUUID();
  const now = new Date().toISOString();
  const job: SyncJob = {
    id,
    status: "queued",
    createdAt: now,
    startedAt: null,
    finishedAt: null,
    result: null,
    error: null,
  };
  JOBS.set(id, job);

  // 异步执行，不阻塞响应
  void runJob(id);

  return Response.json(
    {
      ok: true,
      job: getJobPublicView(job),
      statusUrl: `/api/admin/sync?jobId=${encodeURIComponent(id)}`,
    },
    { status: 202 },
  );
}

/**
 * 查询：GET /api/admin/sync?jobId=...
 * - Header: x-admin-token: <NEXT_PUBLIC_ADMIN_SECRET>
 */
export async function GET(request: Request): Promise<Response> {
  const denied = requireAdminToken(request);
  if (denied) return denied;

  const url = new URL(request.url);
  const jobId = url.searchParams.get("jobId")?.trim() ?? "";
  if (!jobId) {
    return Response.json(
      { ok: false, error: "Missing required query param: jobId" },
      { status: 400 },
    );
  }

  const job = JOBS.get(jobId);
  if (!job) {
    return Response.json({ ok: false, error: "Job not found" }, { status: 404 });
  }

  return Response.json({ ok: true, job: getJobPublicView(job) });
}

