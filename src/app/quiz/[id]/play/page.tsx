"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QuizProgress } from "@/components/quiz-progress";
import { QuizQuestionView } from "@/components/quiz-question";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { useQuiz } from "@/lib/use-quizzes-list";
import type { AttemptAnswer } from "@/types/quiz";

export default function QuizPlayPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuiz(params.id);
  const quiz = data?.quiz ?? null;

  const [participantName, setParticipantName] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isSavingAttempt, setIsSavingAttempt] = useState(false);
  const [attemptSaved, setAttemptSaved] = useState(false);

  useEffect(() => {
    document.title = isFinished ? "Results · QuizPrep" : "Practice · QuizPrep";
  }, [isFinished]);

  useEffect(() => {
    if (!isFinished || !quiz || attemptSaved) return;

    const quizId = quiz.id;
    const total = quiz.questions.length;

    async function saveAttempt() {
      setIsSavingAttempt(true);
      try {
        await apiFetch(`/api/quiz/${quizId}/attempts`, {
          method: "POST",
          body: JSON.stringify({
            participantName: participantName.trim() || undefined,
            score,
            total,
            answers,
          }),
        });
        setAttemptSaved(true);
      } catch {
        setAttemptSaved(false);
      } finally {
        setIsSavingAttempt(false);
      }
    }

    saveAttempt();
  }, [answers, attemptSaved, isFinished, participantName, quiz, score]);

  if (isLoading) {
    return (
      <main className="flex h-full items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading quiz…</p>
      </main>
    );
  }

  if (!quiz || error) {
    return (
      <main className="app-gradient flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-xl shadow-primary/10">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <p className="mt-3 text-muted-foreground">
            This quiz may have been removed or the link is invalid.
          </p>
          <Link
            href="/"
            className={buttonVariants({
              className: "mt-6 shadow-lg shadow-primary/20",
            })}
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  if (!hasStarted) {
    return (
      <main className="flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-10">
        <div className="w-full max-w-lg space-y-6 rounded-3xl border border-primary/10 bg-white p-8 shadow-xl shadow-primary/10">
          <div className="space-y-2 text-center">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Ready to practice
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{quiz.topics}</h1>
            <p className="text-sm text-muted-foreground">
              {quiz.difficulty} · {quiz.questions.length} questions
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant-name">Your name (optional)</Label>
            <Input
              id="participant-name"
              value={participantName}
              onChange={(event) => setParticipantName(event.target.value)}
              placeholder="e.g. Alex"
            />
          </div>

          <Button className="w-full" size="lg" onClick={() => setHasStarted(true)}>
            Start quiz
          </Button>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="app-gradient flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg space-y-4">
          <QuizProgress score={score} total={quiz.questions.length} />
          {isSavingAttempt ? (
            <p className="text-center text-sm text-muted-foreground">
              Saving your attempt…
            </p>
          ) : null}
          <div className="flex justify-center">
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];

  function handleSelect(index: number) {
    if (showResult) return;
    setSelectedIndex(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correctIndex;
    if (isCorrect) {
      setScore((value) => value + 1);
    }

    setAnswers((current) => [
      ...current,
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        options: currentQuestion.options,
        selectedIndex: index,
        correctIndex: currentQuestion.correctIndex,
        isCorrect,
      },
    ]);
  }

  function handleNext() {
    if (!quiz) return;
    if (currentIndex + 1 >= quiz.questions.length) {
      setIsFinished(true);
      return;
    }
    setCurrentIndex((value) => value + 1);
    setSelectedIndex(null);
    setShowResult(false);
  }

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="border-b border-primary/10 bg-white/80 px-4 py-3 backdrop-blur-sm sm:px-6">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Practice session
        </p>
        <p className="text-sm text-muted-foreground">
          {quiz.topics} · {quiz.difficulty} · {quiz.questions.length} questions
        </p>
      </div>

      <QuizQuestionView
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={quiz.questions.length}
        selectedIndex={selectedIndex}
        showResult={showResult}
        onSelect={handleSelect}
        onNext={handleNext}
      />
    </main>
  );
}
