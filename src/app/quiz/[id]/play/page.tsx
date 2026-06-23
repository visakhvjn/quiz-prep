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
import { useQuiz, getQuizDisplayDescription, getQuizSubtopics, getQuizTitle } from "@/lib/use-quizzes-list";
import type { AttemptAnswer } from "@/types/quiz";

export default function QuizPlayPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, error } = useQuiz(params.id);
  const quiz = data?.quiz ?? null;

  const [participantName, setParticipantName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
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
            participantName: participantName.trim(),
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
    const questionCount = quiz.questions.length;
    const optionCount = quiz.questions[0]?.options.length ?? 4;

    function handleStart() {
      const trimmedName = participantName.trim();
      if (!trimmedName) {
        setNameError("Enter your name to start the quiz.");
        return;
      }
      setNameError(null);
      setHasStarted(true);
    }

    return (
      <main className="flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-0 py-6 sm:px-4 sm:py-10">
        <div className="w-full space-y-6 rounded-none border-y border-primary/10 bg-white p-6 shadow-xl shadow-primary/10 sm:max-w-lg sm:rounded-3xl sm:border sm:p-8">
          <div className="space-y-2 text-center">
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Ready to practice
            </p>
            <h1 className="text-3xl font-bold tracking-tight">{getQuizTitle(quiz)}</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {getQuizDisplayDescription(quiz)}
            </p>
            {getQuizSubtopics(quiz).length > 0 ? (
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {getQuizSubtopics(quiz).map((subtopic) => (
                  <span
                    key={subtopic}
                    className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {subtopic}
                  </span>
                ))}
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground capitalize">
              {quiz.difficulty} difficulty
            </p>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-primary/5 px-5 py-4">
            <p className="text-xs font-semibold tracking-wide text-primary uppercase">
              Quiz rules
            </p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/90">
              <li>
                This quiz has <strong>{questionCount} questions</strong>.
              </li>
              <li>
                Each question has <strong>{optionCount} options</strong> — pick
                exactly one answer.
              </li>
              <li>Questions are shown one at a time, in order.</li>
              <li>
                After you select an answer, you&apos;ll see whether it was
                correct and get a short explanation.
              </li>
              <li>You can&apos;t change an answer once it&apos;s submitted.</li>
              <li>
                Complete all {questionCount} questions to see your final score.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="participant-name">
              Your name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="participant-name"
              value={participantName}
              onChange={(event) => {
                setParticipantName(event.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Alex"
              required
              aria-invalid={Boolean(nameError)}
            />
            {nameError ? (
              <p className="text-sm text-destructive">{nameError}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Your name is saved with this attempt so the quiz owner can track
                results.
              </p>
            )}
          </div>

          <Button
            className="h-12 w-full text-base shadow-lg shadow-primary/20"
            size="lg"
            onClick={handleStart}
          >
            Start quiz
          </Button>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex flex-1 flex-col items-center justify-center px-0 py-6 sm:px-4 sm:py-10">
          <div className="w-full sm:max-w-md">
            <QuizProgress
              score={score}
              total={quiz.questions.length}
              isSaving={isSavingAttempt}
            />
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
          {getQuizTitle(quiz)} · {quiz.difficulty} · {quiz.questions.length} questions
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
