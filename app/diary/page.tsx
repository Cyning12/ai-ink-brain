import { BackButton } from "@/app/_components/back-button";

export default function DiaryPage() {
  return (
    <main className="mx-auto min-h-[50vh] w-full max-w-3xl px-8 py-20">
      <BackButton />
      <h1 className="mt-10 font-serif text-3xl text-[#2C2C2C]">日记</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">
        此页占位；后续可接入正文流或私密写作流。
      </p>
    </main>
  );
}
