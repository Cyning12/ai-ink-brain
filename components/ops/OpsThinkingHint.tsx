/** 运行中占位 · S2 统一为 thinking……；节点级文案见 backlog task */
export function OpsThinkingHint({ label = "thinking……" }: { label?: string }) {
  return (
    <p className="flex items-center justify-center gap-2 text-[12px] leading-relaxed text-slate-500">
      <span
        className="inline-block h-3 w-3 shrink-0 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
        aria-hidden
      />
      <span>{label}</span>
    </p>
  );
}
