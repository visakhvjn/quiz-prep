"use client";

import { useSyncExternalStore } from "react";
import {
  getQuizzesListSnapshot,
  subscribeToQuizStore,
} from "@/lib/quiz-store";

export function useQuizzesList() {
  return useSyncExternalStore(
    subscribeToQuizStore,
    getQuizzesListSnapshot,
    () => [],
  );
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
