import Link from "next/link";

export default function DiaryPage() {
  return (
    <main className="mx-auto min-h-[50vh] w-full max-w-3xl px-8 py-20">
      <Link
        href="/"
        className="text-xs text-slate-500 transition-colors hover:text-slate-700"
      >
        ← 返回
      </Link>
      <h1 className="mt-10 font-serif text-3xl text-[#2C2C2C]">日记</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
        此页占位；后续可接入正文流或私密写作流。
      </p>
    </main>
  );
}
