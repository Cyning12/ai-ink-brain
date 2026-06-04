import {
  getDefaultSuggestedQuestions,
  type SuggestedQuestionsMode,
} from "@/lib/unified-chat/suggestedQuestionsDefaults";

const SUGGESTED_QUESTIONS_PATH = "/api/py/chat/suggested-questions";
const FETCH_TIMEOUT_MS = 8_000;

export type SuggestedQuestionsResponse = {
  ok?: boolean;
  questions?: unknown;
};

/** 解析 BFF / Python 返回的推荐问法 JSON；失败返回 null（由调用方降级） */
export function parseSuggestedQuestionsPayload(raw: string): string[] | null {
  let data: unknown;
  try {
    data = JSON.parse(raw) as SuggestedQuestionsResponse;
  } catch {
    return null;
  }
  if (!data || typeof data !== "object") return null;
  const obj = data as SuggestedQuestionsResponse;
  if (obj.ok !== true) return null;
  if (!Array.isArray(obj.questions)) return null;
  const qs = obj.questions
    .filter((q): q is string => typeof q === "string")
    .map((q) => q.trim())
    .filter(Boolean);
  return qs.length > 0 ? qs : null;
}

export type FetchSuggestedQuestionsArgs = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/**
 * 请求推荐问法；非 200 / 缺字段 / 网络错误时返回 null（静默，不抛错）。
 */
export async function fetchSuggestedQuestions(
  args?: FetchSuggestedQuestionsArgs,
): Promise<string[] | null> {
  const timeoutSignal =
    typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
      ? AbortSignal.timeout(FETCH_TIMEOUT_MS)
      : undefined;

  let res: Response;
  try {
    res = await fetch(SUGGESTED_QUESTIONS_PATH, {
      method: "GET",
      headers: { ...args?.headers },
      credentials: "include",
      signal: args?.signal ?? timeoutSignal,
    });
  } catch {
    return null;
  }

  const raw = await res.text().catch(() => "");
  if (!res.ok) return null;
  return parseSuggestedQuestionsPayload(raw);
}

let sessionCached: string[] | null = null;
let sessionInflight: Promise<string[]> | null = null;

/** 测试用：重置同会话内存缓存 */
export function resetSuggestedQuestionsSessionCache(): void {
  sessionCached = null;
  sessionInflight = null;
}

export function peekSuggestedQuestionsSessionCache(): string[] | null {
  return sessionCached;
}

export type LoadSuggestedQuestionsOnceArgs = {
  mode: SuggestedQuestionsMode;
  headers?: Record<string, string>;
};

/**
 * 同浏览器会话内只发起一次上游请求；失败则缓存静态默认列表。
 */
export async function loadSuggestedQuestionsOnce(
  args: LoadSuggestedQuestionsOnceArgs,
): Promise<string[]> {
  if (sessionCached) return sessionCached;
  if (sessionInflight) return sessionInflight;

  const fallback = getDefaultSuggestedQuestions(args.mode);

  sessionInflight = (async () => {
    const fromApi = await fetchSuggestedQuestions({ headers: args.headers });
    const list = fromApi && fromApi.length > 0 ? fromApi : fallback;
    sessionCached = list;
    return list;
  })();

  try {
    return await sessionInflight;
  } catch {
    sessionCached = fallback;
    return fallback;
  } finally {
    sessionInflight = null;
  }
}
