import { createClient } from "@supabase/supabase-js";

/**
 * 服务端 Supabase 客户端所需环境变量：
 * - NEXT_PUBLIC_SUPABASE_URL：项目 URL（服务端可读，勿把 service role 暴露到浏览器）
 * - SUPABASE_SERVICE_ROLE_KEY：服务端写入向量 / RPC（match_documents 等）用，严禁出现在客户端代码
 *
 * 若将来需要浏览器直连 Supabase 只读，可另建使用 NEXT_PUBLIC_SUPABASE_ANON_KEY 的客户端；
 * RAG 写入与敏感查询应始终走本服务端客户端。
 */
type Env = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

function mustGetEnv<K extends keyof Env>(key: K): Env[K] {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value as Env[K];
}

export function createSupabaseServerClient() {
  const url = mustGetEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = mustGetEnv("SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

