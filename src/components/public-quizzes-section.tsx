"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { formatQuizDate, getQuizChatTitle } from "@/lib/use-quizzes-list";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Quiz } from "@/types/quiz";

export function PublicQuizzesSection() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPublicQuizzes() {
      try {
        const response = await apiFetch("/api/quizzes?scope=public");
        if (!response.ok) return;
        const payload = (await response.json()) as { quizzes: Quiz[] };
        setQuizzes(payload.quizzes ?? []);
      } catch {
        setQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadPublicQuizzes();
  }, []);

  return (
    <section id="public-quizzes" className="scroll-mt-6 px-6 pb-20 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Layers className="size-4" />
              <span className="text-xs font-semibold tracking-widest uppercase">
                Public library
              </span>
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Quizzes from the community
            </h2>
          </div>
          <Link
            href="/create"
            className={buttonVariants({ variant: "ghost", className: "gap-1 text-primary" })}
          >
            Publish yours
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-2xl bg-primary/5"
              />
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="home-empty-quizzes rounded-3xl px-6 py-16 text-center">
            <p className="text-lg font-semibold">Nothing published yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Create a quiz and flip it to public in Settings — it&apos;ll show
              up here for everyone to practice.
            </p>
            <Link href="/create" className={buttonVariants({ className: "mt-6" })}>
              Create the first one
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {quizzes.map((quiz, index) => (
              <li key={quiz.id}>
                <Link
                  href={`/quiz/${quiz.id}/play`}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border border-primary/10 bg-white px-5 py-4 shadow-sm transition-all",
                    "hover:border-primary/25 hover:shadow-md hover:shadow-primary/8",
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold group-hover:text-primary">
                      {getQuizChatTitle(quiz.topics)}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {quiz.questions.length} questions · {quiz.difficulty} ·{" "}
                      {formatQuizDate(quiz.createdAt)}
                    </p>
                  </div>
                  <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
