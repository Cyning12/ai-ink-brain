import { SiteNav } from "../_components/site-nav";

export default function AboutPage() {
  return (
    <div className="min-h-full">
      <SiteNav />
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <p className="mt-4 max-w-2xl text-[color:var(--color-muted)]">
          关于作者与项目理念（后续接入简历与时间线）。
        </p>
      </main>
    </div>
  );
}

