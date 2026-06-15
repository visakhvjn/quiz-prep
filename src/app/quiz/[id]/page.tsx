"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizAttemptsPanel } from "@/components/quiz-attempts-panel";
import { QuizQuestionsEditor } from "@/components/quiz-questions-editor";
import { QuizSettingsPanel } from "@/components/quiz-settings-panel";
import { buttonVariants } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useQuiz } from "@/lib/use-quizzes-list";
import type { Quiz } from "@/types/quiz";

export default function QuizManagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, error, reload } = useQuiz(params.id);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (data?.quiz) {
      setQuiz(data.quiz);
      document.title = `${data.quiz.topics} · QuizPrep`;
    }
  }, [data]);

  useEffect(() => {
    if (!isLoading && data && !data.isOwner) {
      router.replace(`/quiz/${params.id}/play`);
    }
  }, [data, isLoading, params.id, router]);

  if (isLoading) {
    return (
      <main className="flex h-full items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading quiz…</p>
      </main>
    );
  }

  if (!quiz || error || !data?.isOwner) {
    return (
      <main className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-3xl border border-primary/10 bg-white p-8 text-center shadow-xl shadow-primary/10">
          <h1 className="text-2xl font-bold">Quiz not found</h1>
          <p className="mt-3 text-muted-foreground">
            This quiz may not exist or you do not have access to manage it.
          </p>
          <Link href="/" className={buttonVariants({ className: "mt-6" })}>
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="border-b border-primary/10 bg-white/80 px-4 py-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Quiz editor
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{quiz.topics}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {quiz.difficulty} · {quiz.questions.length} questions ·{" "}
              {quiz.visibility === "public" ? "Public" : "Private"}
            </p>
          </div>
          <Link
            href={`/quiz/${quiz.id}/play`}
            className={buttonVariants({ variant: "outline" })}
          >
            <ExternalLink className="size-4" />
            Preview quiz
          </Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
        <Tabs defaultValue="questions" className="gap-6">
          <TabsList variant="line">
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="attempts">Attempts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="pt-2">
            <QuizQuestionsEditor
              quiz={quiz}
              onSaved={(nextQuiz) => {
                setQuiz(nextQuiz);
                reload();
              }}
            />
          </TabsContent>

          <TabsContent value="attempts" className="pt-2">
            <QuizAttemptsPanel quizId={quiz.id} />
          </TabsContent>

          <TabsContent value="settings" className="pt-2">
            <QuizSettingsPanel
              quiz={quiz}
              onSaved={(nextQuiz) => {
                setQuiz(nextQuiz);
                reload();
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
