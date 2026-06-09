/** ChainEventCard 纯函数工具（F-01 文件拆分） */

export function chainEventFmtTs(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  const d = new Date(ms);
  return d.toLocaleTimeString();
}

export function chainEventSafeStringify(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export function extractTextFromChainPayload(payload: Record<string, unknown>): string {
  const direct = typeof payload.text === "string" ? payload.text : "";
  if (direct.trim()) return direct;
  const answer = typeof payload.answer === "string" ? payload.answer : "";
  if (answer.trim()) return answer;
  const output =
    payload.output && typeof payload.output === "object"
      ? (payload.output as Record<string, unknown>)
      : null;
  const outAnswer = output && typeof output.answer === "string" ? output.answer : "";
  if (outAnswer.trim()) return outAnswer;
  return "";
}

export function pickChainSourceTitle(s: unknown): string {
  if (!s || typeof s !== "object") return "source";
  const o = s as Record<string, unknown>;
  const filename = typeof o.filename === "string" ? o.filename : "";
  const path = typeof o.path === "string" ? o.path : "";
  const relativePath = typeof o.relativePath === "string" ? o.relativePath : "";
  const id = typeof o.id === "string" || typeof o.id === "number" ? String(o.id) : "";
  return (filename || path || relativePath || (id ? `source#${id}` : "") || "source").trim();
}

export function pickChainSourceContent(s: unknown): string {
  if (!s || typeof s !== "object") return "";
  const o = s as Record<string, unknown>;
  const content = typeof o.content === "string" ? o.content : "";
  const snippet = typeof o.snippet === "string" ? o.snippet : "";
  return (content || snippet).trim();
}

export async function copyChainTextToClipboard(text: string): Promise<boolean> {
  const t = text.trim();
  if (!t) return false;
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch {
    try {
      const el = document.createElement("textarea");
      el.value = t;
      el.setAttribute("readonly", "true");
      el.style.position = "fixed";
      el.style.top = "-9999px";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}
