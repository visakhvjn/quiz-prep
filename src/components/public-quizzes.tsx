"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import { formatQuizDate, getQuizChatTitle } from "@/lib/use-quizzes-list";
import type { Quiz } from "@/types/quiz";

export function PublicQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    async function loadPublicQuizzes() {
      try {
        const response = await apiFetch("/api/quizzes?scope=public");
        if (!response.ok) return;
        const payload = (await response.json()) as { quizzes: Quiz[] };
        setQuizzes(payload.quizzes ?? []);
      } catch {
        setQuizzes([]);
      }
    }

    loadPublicQuizzes();
  }, []);

  if (quizzes.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-white/10 px-8 py-10">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium tracking-wide text-white/60 uppercase">
            Public quizzes
          </p>
          <h2 className="text-2xl font-bold text-white">
            Practice what others are sharing
          </h2>
        </div>

        <ul className="space-y-3">
          {quizzes.map((quiz) => (
            <li key={quiz.id}>
              <Link
                href={`/quiz/${quiz.id}/play`}
                className="block rounded-xl border border-white/15 bg-white/10 px-4 py-3 transition-colors hover:bg-white/15"
              >
                <p className="font-medium text-white">
                  {getQuizChatTitle(quiz.topics)}
                </p>
                <p className="mt-1 text-sm text-white/70">
                  {formatQuizDate(quiz.createdAt)} · {quiz.questions.length}{" "}
                  questions · {quiz.difficulty}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
