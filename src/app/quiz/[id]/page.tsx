"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { QuizProgress } from "@/components/quiz-progress";
import { QuizQuestionView } from "@/components/quiz-question";
import { buttonVariants } from "@/components/ui/button";
import { getQuizSnapshot, subscribeToQuizStore } from "@/lib/quiz-store";

function useStoredQuiz(id: string) {
  return useSyncExternalStore(
    subscribeToQuizStore,
    () => getQuizSnapshot(id),
    () => null,
  );
}

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const quiz = useStoredQuiz(params.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    document.title = isFinished
      ? "Results · QuizPrep"
      : "Practice · QuizPrep";
  }, [isFinished]);

  if (!quiz) {
    return (
      <main className="app-gradient flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-xl shadow-primary/10">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <p className="mt-3 text-muted-foreground">
            This quiz may have expired from local storage or the link is invalid.
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

  if (isFinished) {
    return (
      <main className="app-gradient flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-lg">
          <QuizProgress score={score} total={quiz.questions.length} />
        </div>
      </main>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];

  function handleSelect(index: number) {
    if (showResult) return;
    setSelectedIndex(index);
    setShowResult(true);
    if (index === currentQuestion.correctIndex) {
      setScore((value) => value + 1);
    }
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
