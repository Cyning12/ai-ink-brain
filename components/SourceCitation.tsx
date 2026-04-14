import type { SourceCitation as SourceCitationItem } from "@/lib/chat/chatApi";

type Props = {
  sources: SourceCitationItem[];
  onOpenSnippet?: (source: SourceCitationItem) => void;
};

function scoreLabel(score: number): string {
  if (!Number.isFinite(score)) return "";
  return score.toFixed(4);
}

export function SourceCitation({ sources, onOpenSnippet }: Props) {
  if (!sources.length) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="font-serif text-[11px] tracking-wide text-slate-500">
        引用来源
      </div>
      <div className="grid gap-2">
        {sources.map((s) => {
          const title =
            (typeof s.filename === "string" && s.filename) ||
            (typeof s.relativePath === "string" && s.relativePath) ||
            `source#${String(s.id)}`;
          const subtitleParts = [
            typeof s.category === "string" && s.category ? s.category : "",
            typeof s.slug === "string" && s.slug ? s.slug : "",
            typeof s.chunk_index === "number" ? `chunk:${s.chunk_index}` : "",
            typeof s.fused_score === "number" ? `score:${scoreLabel(s.fused_score)}` : "",
          ].filter(Boolean);
          const subtitle = subtitleParts.join(" · ");

          return (
            <button
              key={`${s.relativePath}:${s.chunk_index}:${s.id}`}
              type="button"
              onClick={() => {
                if (s.original_link) {
                  window.open(s.original_link, "_blank", "noopener,noreferrer");
                  return;
                }
                onOpenSnippet?.(s);
              }}
              className="group rounded-2xl border border-[color:var(--color-border)] bg-[#f9f9f7] px-3 py-2 text-left transition-colors hover:bg-white/60"
              title={s.original_link ? "打开原文" : "预览摘要"}
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
                  {s.original_link ? "↗" : "预览"}
                </div>
              </div>

              {typeof s.snippet === "string" && s.snippet.trim() ? (
                <div className="mt-2 line-clamp-3 whitespace-pre-wrap text-[11px] leading-relaxed text-slate-600">
                  {s.snippet.trim()}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

