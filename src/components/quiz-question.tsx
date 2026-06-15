"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types/quiz";

interface QuizQuestionViewProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedIndex: number | null;
  showResult: boolean;
  onSelect: (index: number) => void;
  onNext: () => void;
}

export function QuizQuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex,
  showResult,
  onSelect,
  onNext,
}: QuizQuestionViewProps) {
  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {question.subtopic}
              </span>
            </div>
            <Progress
              value={progress}
              className="[&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:bg-primary/10"
            />
          </div>

          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              Interview question
            </p>
            <h2 className="mt-3 text-xl leading-relaxed font-semibold tracking-tight sm:text-2xl">
              {question.question}
            </h2>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Choose an answer
            </p>
            <div className="grid gap-3">
              {question.options.map((option, index) => {
                const isSelected = selectedIndex === index;
                const isCorrect = index === question.correctIndex;
                const showCorrect = showResult && isCorrect;
                const showIncorrect = showResult && isSelected && !isCorrect;

                return (
                  <button
                    key={`${question.id}-${index}`}
                    type="button"
                    disabled={showResult}
                    onClick={() => onSelect(index)}
                    className={cn(
                      "rounded-xl border px-4 py-3.5 text-left text-base transition-all duration-200",
                      !showResult &&
                        "border-primary/15 bg-white hover:border-primary/30 hover:bg-primary/5",
                      isSelected &&
                        !showResult &&
                        "border-primary bg-primary/5 shadow-sm",
                      showCorrect &&
                        "border-emerald-400 bg-emerald-50 text-emerald-950",
                      showIncorrect &&
                        "border-red-300 bg-red-50 text-red-950",
                    )}
                  >
                    <span
                      className={cn(
                        "mr-3 inline-flex h-7 w-7 items-center justify-center rounded-lg text-sm font-semibold",
                        !showResult && "bg-primary/10 text-primary",
                        showCorrect && "bg-emerald-200 text-emerald-900",
                        showIncorrect && "bg-red-200 text-red-900",
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {showResult && question.explanation && (
            <div className="rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4">
              <p className="mb-2 text-xs font-semibold tracking-wide text-primary uppercase">
                Explanation
              </p>
              <p className="text-sm leading-relaxed text-foreground/90">
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>

      {showResult && (
        <div className="sticky bottom-0 border-t border-primary/10 bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto w-full max-w-2xl">
            <Button
              size="lg"
              className="h-12 w-full shadow-lg shadow-primary/20"
              onClick={onNext}
            >
              {questionNumber === totalQuestions ? "See results" : "Next question"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
