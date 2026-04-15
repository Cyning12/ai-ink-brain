import type { SourceCitation as SourceItem } from "@/lib/chat/chatApi";

type Props = {
  sources: SourceItem[];
  onOpenSnippet?: (source: SourceItem) => void;
};

function scoreLabel(score: number): string {
  if (!Number.isFinite(score)) return "";
  return score.toFixed(4);
}

function pickTitle(s: SourceItem): string {
  return (
    (typeof s.filename === "string" && s.filename) ||
    (typeof s.path === "string" && s.path) ||
    (typeof s.relativePath === "string" && s.relativePath) ||
    `source#${String(s.id)}`
  );
}

function pickContent(s: SourceItem): string {
  const t =
    (typeof s.content === "string" && s.content) ||
    (typeof s.snippet === "string" && s.snippet) ||
    "";
  return t.trim();
}

function pickUrl(s: SourceItem): string | null {
  return (
    (typeof s.url === "string" && s.url) ||
    (typeof s.original_link === "string" && s.original_link) ||
    null
  );
}

function pickScore(s: SourceItem): number | null {
  const v =
    (typeof s.score === "number" && s.score) ||
    (typeof s.fused_score === "number" && s.fused_score) ||
    null;
  return v;
}

export function SourceCitations({ sources, onOpenSnippet }: Props) {
  if (!sources.length) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="font-serif text-[11px] tracking-wide text-slate-500">
        参考资料
      </div>
      <div className="grid gap-2">
        {sources.map((s) => {
          const title = pickTitle(s);
          const content = pickContent(s);
          const url = pickUrl(s);
          const score = pickScore(s);

          const subtitleParts = [
            typeof s.category === "string" && s.category ? s.category : "",
            typeof s.slug === "string" && s.slug ? s.slug : "",
            typeof s.chunk_index === "number" ? `chunk:${s.chunk_index}` : "",
            typeof score === "number" ? `score:${scoreLabel(score)}` : "",
          ].filter(Boolean);
          const subtitle = subtitleParts.join(" · ");

          return (
            <button
              key={`${String(s.id)}:${String(s.path ?? s.relativePath ?? "")}:${String(
                s.chunk_index ?? "",
              )}`}
              type="button"
              onClick={() => {
                if (url) {
                  window.open(url, "_blank", "noopener,noreferrer");
                  return;
                }
                onOpenSnippet?.(s);
              }}
              className="group relative rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7] px-3 py-2 text-left transition-all duration-200 hover:bg-white/60"
              title={url ? "打开原文" : "预览摘要"}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-serif text-[13px] text-[#2c2c2c]">
                    {title}
                  </div>
                  {subtitle && (
                    <div className="mt-0.5 truncate text-[10px] text-slate-500">
                      {subtitle}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-[10px] text-slate-400 group-hover:text-slate-500">
                  {url ? "↗" : "预览"}
                </div>
              </div>

              {/* 说明：悬浮预览会导致 hover 命中区域变化，从而产生“抖动/失焦循环”。统一使用点击弹层预览。 */}
            </button>
          );
        })}
      </div>
    </div>
  );
}

