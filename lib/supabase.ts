/**
 * Supabase 客户端统一出口（服务端使用 service role 写入向量库）。
 * 具体实现见 lib/supabase/server.ts，避免各处散落重复配置。
 */
export { createSupabaseServerClient } from "@/lib/supabase/server";
