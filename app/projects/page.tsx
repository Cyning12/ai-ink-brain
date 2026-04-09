import { SiteNav } from "../_components/site-nav";

export default function ProjectsPage() {
  return (
    <div className="min-h-full">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
        <p className="mt-4 max-w-2xl text-[color:var(--color-muted)]">
          实验室与 Demo 展示区（后续接入卡片化与筛选）。
        </p>
      </main>
    </div>
  );
}

