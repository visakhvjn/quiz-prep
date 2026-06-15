"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api-client";
import { formatAttemptDate } from "@/lib/use-quizzes-list";
import { cn } from "@/lib/utils";
import type { QuizAttempt, QuizAttemptDetail } from "@/types/quiz";

interface QuizAttemptsPanelProps {
  quizId: string;
}

export function QuizAttemptsPanel({ quizId }: QuizAttemptsPanelProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttemptDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAttempts() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiFetch(`/api/quiz/${quizId}/attempts`);
        if (!response.ok) {
          throw new Error("Failed to load attempts");
        }

        const payload = (await response.json()) as { attempts: QuizAttempt[] };
        setAttempts(payload.attempts ?? []);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load attempts",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadAttempts();
  }, [quizId]);

  async function openAttempt(attemptId: string) {
    setIsDetailLoading(true);

    try {
      const response = await apiFetch(
        `/api/quiz/${quizId}/attempts/${attemptId}`,
      );
      if (!response.ok) {
        throw new Error("Failed to load attempt");
      }

      const payload = (await response.json()) as { attempt: QuizAttemptDetail };
      setSelectedAttempt(payload.attempt);
    } catch {
      setSelectedAttempt(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading attempts…</p>;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-primary/20 bg-white px-6 py-10 text-center">
        <p className="font-medium">No attempts yet</p>
        <p className="mt-2 text-sm text-muted-foreground">
          When someone takes this quiz, their results will show up here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-primary/10 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">S.No</TableHead>
              <TableHead>Participant</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempts.map((attempt, index) => (
              <TableRow
                key={attempt.id}
                className="cursor-pointer"
                onClick={() => openAttempt(attempt.id)}
              >
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  {attempt.participantName?.trim() || "Anonymous"}
                </TableCell>
                <TableCell>
                  {attempt.score}/{attempt.total}
                </TableCell>
                <TableCell>{formatAttemptDate(attempt.completedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={Boolean(selectedAttempt) || isDetailLoading}
        onOpenChange={(open) => {
          if (!open) setSelectedAttempt(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attempt details</DialogTitle>
            <DialogDescription>
              {selectedAttempt
                ? `${selectedAttempt.participantName?.trim() || "Anonymous"} · ${selectedAttempt.score}/${selectedAttempt.total} · ${formatAttemptDate(selectedAttempt.completedAt)}`
                : "Loading attempt…"}
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading && !selectedAttempt ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : null}

          {selectedAttempt ? (
            <div className="space-y-4">
              {selectedAttempt.answers.map((answer, index) => (
                <div
                  key={`${answer.questionId}-${index}`}
                  className="rounded-xl border border-primary/10 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <p className="font-medium">
                      {index + 1}. {answer.question}
                    </p>
                    <Badge
                      variant={answer.isCorrect ? "default" : "destructive"}
                    >
                      {answer.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {answer.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm",
                          optionIndex === answer.correctIndex &&
                            "border-primary bg-primary/10",
                          optionIndex === answer.selectedIndex &&
                            optionIndex !== answer.correctIndex &&
                            "border-destructive/40 bg-destructive/10",
                        )}
                      >
                        <span className="mr-2 font-medium">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        {option}
                        {optionIndex === answer.selectedIndex ? (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (selected)
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
