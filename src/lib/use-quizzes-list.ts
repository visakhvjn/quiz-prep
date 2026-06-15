"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import { subscribeQuizListChanged } from "@/lib/quiz-events";
import type { Quiz, QuizWithAccess } from "@/types/quiz";

export function useQuizzesList() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  const load = useCallback(async () => {
    try {
      const response = await apiFetch("/api/quizzes");
      if (!response.ok) return;
      const payload = (await response.json()) as { quizzes: Quiz[] };
      setQuizzes(payload.quizzes ?? []);
    } catch {
      setQuizzes([]);
    }
  }, []);

  useEffect(() => {
    load();
    return subscribeQuizListChanged(load);
  }, [load]);

  return quizzes;
}

export function useQuiz(id: string) {
  const [data, setData] = useState<QuizWithAccess | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/quiz/${id}`);
      if (!response.ok) {
        setData(null);
        setError("Quiz not found");
        return;
      }

      const payload = (await response.json()) as QuizWithAccess;
      setData(payload);
    } catch {
      setData(null);
      setError("Failed to load quiz");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, reload: load };
}

export function getQuizChatTitle(topics: string) {
  const trimmed = topics.trim();
  if (trimmed.length <= 42) return trimmed;
  return `${trimmed.slice(0, 42)}…`;
}

export function formatQuizDate(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatAttemptDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
