"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function BackButton(props: { label?: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="mb-8 inline-flex items-center gap-1.5 rounded-xl text-muted-foreground hover:text-foreground"
    >
      <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      {props.label ?? "后退"}
    </Button>
  );
}

