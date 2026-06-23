"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiFetch } from "@/lib/api-client";
import {
  formatQuizDate,
  getQuizDisplayDescription,
  getQuizSubtopics,
  getQuizTitle,
} from "@/lib/use-quizzes-list";
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-44 animate-pulse rounded-2xl bg-primary/5"
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
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const subtopics = getQuizSubtopics(quiz);
              const visibleSubtopics = subtopics.slice(0, 5);
              const hiddenCount = subtopics.length - visibleSubtopics.length;

              return (
              <Link
                key={quiz.id}
                href={`/quiz/${quiz.id}/play`}
                className="group block h-full"
              >
                <Card
                  className={cn(
                    "h-full border-primary/10 bg-white shadow-sm transition-all",
                    "hover:border-primary/25 hover:shadow-md hover:shadow-primary/8",
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="line-clamp-2 text-lg font-semibold group-hover:text-primary">
                      {getQuizTitle(quiz)}
                    </CardTitle>
                    <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                      {getQuizDisplayDescription(quiz)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    {subtopics.length > 0 ? (
                      <div className="hidden flex-wrap gap-1.5 sm:flex">
                        {visibleSubtopics.map((subtopic) => (
                          <span
                            key={subtopic}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                          >
                            {subtopic}
                          </span>
                        ))}
                        {hiddenCount > 0 ? (
                          <span className="self-center text-xs text-muted-foreground">
                            +{hiddenCount} more
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    <p className="text-xs font-medium tracking-wide text-primary uppercase">
                      {quiz.difficulty}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto justify-between border-t border-primary/8 bg-primary/[0.03] text-xs text-muted-foreground">
                    <span>
                      {quiz.questions.length} questions · {formatQuizDate(quiz.createdAt)}
                    </span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                  </CardFooter>
                </Card>
              </Link>
            );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
