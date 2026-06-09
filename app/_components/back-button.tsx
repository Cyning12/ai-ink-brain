"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isPortfolioMode } from "@/lib/site-mode";

export type BackButtonProps = {
  label?: string;
  /** 指定返回路径（优先于 router.back）；文章详情建议指向目录页 */
  href?: string;
  /** Portfolio 模式默认隐藏；文章详情等传 true */
  showInPortfolio?: boolean;
};

const backButtonClassName =
  "mb-8 inline-flex items-center gap-1.5 rounded-xl text-muted-foreground hover:text-foreground";

export function BackButton(props: BackButtonProps) {
  const router = useRouter();
  const label = props.label ?? "后退";

  if (isPortfolioMode() && !props.showInPortfolio) {
    return null;
  }

  const content = (
    <>
      <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
      {label}
    </>
  );

  if (props.href) {
    return (
      <Link href={props.href} className={backButtonClassName}>
        {content}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className={backButtonClassName}
    >
      {content}
    </Button>
  );
}
