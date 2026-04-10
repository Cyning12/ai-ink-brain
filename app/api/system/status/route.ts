import { NextResponse } from "next/server";

/** 供前端挂件读取部署环境信息（不含密钥） */
export async function GET() {
  const vercelEnv = process.env.VERCEL_ENV ?? "development";
  const vercelUrl = process.env.VERCEL_URL ?? null;
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID ?? null;

  return NextResponse.json({
    ok: true,
    vercelEnv,
    vercelUrl,
    deploymentId,
  });
}
