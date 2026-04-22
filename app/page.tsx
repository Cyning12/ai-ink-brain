import { HomeModules } from "@/app/_components/home-modules";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-8 py-28">
        <p className="text-[11px] tracking-[0.45em] text-slate-500/90">
          水墨
        </p>
        <h1 className="mt-8 font-serif text-[clamp(2rem,6vw,3rem)] font-semibold leading-tight tracking-tight text-[#2C2C2C]">
          Cyning
        </h1>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-600/95">
          低密度留白，墨色为骨；学习、实验与日常，分册而置。
        </p>

        <div
          className="mt-3 h-px w-12 bg-[color:var(--color-border)]"
          aria-hidden
        />

        <HomeModules />
      </main>

      <footer className="mt-auto border-t border-[color:var(--color-border)]/70">
        <div className="mx-auto max-w-3xl px-8 py-10 text-center text-[11px] tracking-wide text-slate-400">
          © {new Date().getFullYear()} Cyning · Ink
        </div>
      </footer>
    </div>
  );
}
