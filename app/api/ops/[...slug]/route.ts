import { requireOpsDeskAccess } from "@/lib/auth/ops-session";

export const runtime = "nodejs";

async function handler(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  const denied = await requireOpsDeskAccess(request);
  if (denied) return denied;

  const { slug } = await params;
  return Response.json({
    ok: true,
    skeleton: true,
    path: `/api/ops/${slug.join("/")}`,
    method: request.method,
    message: "Ops Desk BFF 骨架已就绪，P0-4~P1 将按端点细化实现。",
  });
}

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  return handler(request, context);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  return handler(request, context);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  return handler(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  return handler(request, context);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string[] }> },
): Promise<Response> {
  return handler(request, context);
}
