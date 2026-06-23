"use client";

import Link from "next/link";
import { ArrowRight, Home, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  score: number;
  total: number;
  isSaving?: boolean;
}

function getResultCopy(percentage: number) {
  if (percentage === 100) {
    return {
      headline: "Perfect score!",
      subline: "You nailed every question.",
      tone: "excellent" as const,
    };
  }
  if (percentage >= 80) {
    return {
      headline: "Excellent work!",
      subline: "Strong grasp of the material.",
      tone: "excellent" as const,
    };
  }
  if (percentage >= 50) {
    return {
      headline: "Nice effort!",
      subline: "A solid round — review the ones you missed.",
      tone: "good" as const,
    };
  }
  if (percentage > 0) {
    return {
      headline: "Keep practicing!",
      subline: "Every attempt builds recall.",
      tone: "practice" as const,
    };
  }
  return {
    headline: "Session complete",
    subline: "Tough set — run it again when you're ready.",
    tone: "practice" as const,
  };
}

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function QuizProgress({ score, total, isSaving = false }: QuizProgressProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const missed = total - score;
  const { headline, subline, tone } = getResultCopy(percentage);
  const ringOffset =
    RING_CIRCUMFERENCE - (percentage / 100) * RING_CIRCUMFERENCE;

  const ringColor =
    tone === "excellent"
      ? "stroke-emerald-500"
      : tone === "good"
        ? "stroke-primary"
        : "stroke-amber-500";

  const ringBg =
    tone === "excellent"
      ? "stroke-emerald-100"
      : tone === "good"
        ? "stroke-primary/15"
        : "stroke-amber-100";

  return (
    <div
      className={cn(
        "w-full space-y-6 px-4 py-6",
        "sm:rounded-3xl sm:border sm:border-primary/10 sm:bg-white sm:p-8 sm:shadow-xl sm:shadow-primary/10",
      )}
    >
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <Sparkles className="size-3.5" />
          Session complete
        </span>

        <div className="relative mt-6 size-36 sm:size-40">
          <svg
            className="size-full -rotate-90"
            viewBox="0 0 120 120"
            aria-hidden
          >
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              className={ringBg}
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r={RING_RADIUS}
              fill="none"
              className={cn(ringColor, "transition-all duration-700 ease-out")}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {percentage}%
            </p>
            <p className="text-xs font-medium text-muted-foreground">correct</p>
          </div>
        </div>

        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
          {headline}
        </h2>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {subline}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="px-1 py-2 text-center sm:rounded-2xl sm:border sm:border-primary/10 sm:bg-primary/[0.04] sm:px-3 sm:py-4">
          <p className="text-xl font-bold text-emerald-600 sm:text-2xl">{score}</p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide sm:text-xs">
            Correct
          </p>
        </div>
        <div className="px-1 py-2 text-center sm:rounded-2xl sm:border sm:border-primary/10 sm:bg-primary/[0.04] sm:px-3 sm:py-4">
          <p className="text-xl font-bold text-foreground sm:text-2xl">{missed}</p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide sm:text-xs">
            Missed
          </p>
        </div>
        <div className="px-1 py-2 text-center sm:rounded-2xl sm:border sm:border-primary/10 sm:bg-primary/[0.04] sm:px-3 sm:py-4">
          <p className="text-xl font-bold text-primary sm:text-2xl">{total}</p>
          <p className="mt-0.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide sm:text-xs">
            Total
          </p>
        </div>
      </div>

      <div className="space-y-2.5 pt-1">
        <Link
          href="/create"
          className={buttonVariants({
            size: "lg",
            className: "h-12 w-full gap-2 text-base shadow-lg shadow-primary/20",
          })}
        >
          Practice another topic
          <ArrowRight className="size-4" />
        </Link>
        <Link
          href="/"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-11 w-full gap-2 text-base",
          })}
        >
          <Home className="size-4" />
          Back to home
        </Link>
      </div>

      {isSaving ? (
        <p className="text-center text-xs text-muted-foreground">
          Saving your attempt…
        </p>
      ) : null}
    </div>
  );
}
