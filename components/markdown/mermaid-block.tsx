"use client";

import mermaid from "mermaid";
import { useEffect, useId, useRef, useState } from "react";

let mermaidInitialized = false;

function ensureMermaidInit() {
  if (mermaidInitialized) return;
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "strict",
    fontFamily:
      'ui-sans-serif, system-ui, "PingFang SC", "Microsoft YaHei", sans-serif',
  });
  mermaidInitialized = true;
}

type MermaidBlockProps = {
  code: string;
};

/** 客户端渲染 Mermaid 图（```mermaid 代码块）。 */
export function MermaidBlock({ code }: MermaidBlockProps) {
  const reactId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !code.trim()) return;

    let cancelled = false;
    const renderId = `mermaid-${reactId}-${Date.now()}`;

    async function renderDiagram() {
      ensureMermaidInit();
      try {
        const { svg } = await mermaid.render(renderId, code.trim());
        if (cancelled || !container) return;
        container.innerHTML = svg;
        setError(null);
      } catch (err) {
        if (cancelled || !container) return;
        setError(err instanceof Error ? err.message : "Mermaid 渲染失败");
        container.innerHTML = "";
      }
    }

    void renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, reactId]);

  if (!code.trim()) return null;

  return (
    <figure className="my-6">
      <div
        ref={containerRef}
        className="overflow-x-auto rounded-2xl border border-[color:var(--color-border)] bg-white/50 px-4 py-5 [&_svg]:mx-auto [&_svg]:max-w-full"
        aria-label="Mermaid 图表"
      />
      {error ? (
        <figcaption className="mt-2 rounded-lg bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
          {error}
        </figcaption>
      ) : null}
      <noscript>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs">
          {code}
        </pre>
      </noscript>
    </figure>
  );
}
