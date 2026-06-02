import { BackButton } from "@/app/_components/back-button";
import { getSiteMode } from "@/lib/site-mode";
import { permanentRedirect } from "next/navigation";

export default function AboutPage() {
  if (getSiteMode() === "portfolio") {
    permanentRedirect("/resume");
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <BackButton />
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        关于作者与项目理念（后续接入简历与时间线）。
      </p>
    </main>
  );
}
