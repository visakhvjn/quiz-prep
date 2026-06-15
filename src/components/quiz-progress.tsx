"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizProgressProps {
  score: number;
  total: number;
}

export function QuizProgress({ score, total }: QuizProgressProps) {
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <div className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-xl shadow-primary/10">
      <div className="panel-purple px-8 py-10 text-center text-white">
        <p className="text-sm font-medium tracking-wide text-white/70 uppercase">
          Session complete
        </p>
        <h2 className="mt-2 text-3xl font-bold">Great work!</h2>
      </div>
      <div className="space-y-6 px-8 py-10 text-center">
        <div>
          <p className="text-6xl font-bold text-primary">
            {score}
            <span className="text-3xl text-muted-foreground">/{total}</span>
          </p>
          <p className="mt-2 text-lg text-muted-foreground">{percentage}% correct</p>
        </div>
        <div
          className={cn(
            "mx-auto h-2 max-w-xs overflow-hidden rounded-full bg-primary/10",
          )}
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <Link
          href="/"
          className={buttonVariants({
            size: "lg",
            className: "h-12 px-8 shadow-lg shadow-primary/20",
          })}
        >
          Generate new quiz
        </Link>
      </div>
    </div>
  );
}
