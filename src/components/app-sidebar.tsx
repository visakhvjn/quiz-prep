"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquarePlus, PanelLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatQuizDate,
  getQuizTitle,
  useQuizzesList,
} from "@/lib/use-quizzes-list";

export function AppBrand({
  onNavigate,
  variant = "default",
}: {
  onNavigate?: () => void;
  variant?: "default" | "light";
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex min-w-0 items-center gap-2.5"
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-sm",
          variant === "light"
            ? "bg-white text-primary shadow-black/10"
            : "bg-primary text-primary-foreground shadow-primary/30",
        )}
      >
        Q
      </span>
      <span
        className={cn(
          "truncate text-lg font-semibold tracking-tight",
          variant === "light" && "text-white",
        )}
      >
        QuizPrep
      </span>
    </Link>
  );
}

interface AppSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
  onNewQuiz?: () => void;
}

export function AppSidebar({
  collapsed,
  onNavigate,
  onNewQuiz,
}: AppSidebarProps) {
  const pathname = usePathname();
  const quizzes = useQuizzesList();

  return (
    <aside
        className={cn(
          "flex h-full shrink-0 flex-col border-r border-primary/10 bg-white/95 backdrop-blur-sm transition-all duration-200",
          collapsed ? "w-0 overflow-hidden border-r-0 opacity-0" : "w-72 opacity-100",
        )}
    >
      <div className="p-3 pt-4">
        <Link
          href="/create"
          onClick={onNewQuiz}
          className={buttonVariants({
            variant: "outline",
            className:
              "h-10 w-full justify-start gap-2 border-primary/20 bg-white shadow-sm",
          })}
        >
          <MessageSquarePlus className="size-4" />
          New quiz
        </Link>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4">
        <p className="px-2 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Your quizzes
        </p>

        {quizzes.length === 0 ? (
          <p className="px-2 py-6 text-sm leading-relaxed text-muted-foreground">
            Generated quizzes will appear here, like chat history.
          </p>
        ) : (
          <ul className="space-y-1">
            {quizzes.map((quiz) => {
              const href = `/quiz/${quiz.id}`;
              const isActive = pathname === href;

              return (
                <li key={quiz.id}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-primary/5",
                    )}
                  >
                    <p className="truncate text-sm font-medium">
                      {getQuizTitle(quiz)}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 truncate text-xs",
                        isActive
                          ? "text-primary/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {formatQuizDate(quiz.createdAt)} · {quiz.questions.length}{" "}
                      questions · {quiz.difficulty}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

export function SidebarToggleButton({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onToggle}
      aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
    >
      <PanelLeft className="size-4" />
    </Button>
  );
}
