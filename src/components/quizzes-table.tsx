"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getQuizzesListSnapshot,
  subscribeToQuizStore,
} from "@/lib/quiz-store";

function useQuizzesList() {
  return useSyncExternalStore(
    subscribeToQuizStore,
    getQuizzesListSnapshot,
    () => [],
  );
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function QuizzesTable() {
  const quizzes = useQuizzesList();

  if (quizzes.length === 0) {
    return (
      <div className="rounded-md border border-primary/10 bg-white p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold">No quizzes yet</h2>
        <p className="mt-2 text-muted-foreground">
          Generate your first quiz and it will show up here.
        </p>
        <Link href="/" className={buttonVariants({ className: "mt-6" })}>
          Generate Quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-primary/10 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">S.No</TableHead>
            <TableHead>Topics</TableHead>
            <TableHead>Difficulty</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz, index) => (
            <TableRow key={quiz.id}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell className="max-w-xs truncate font-medium">
                {quiz.topics}
              </TableCell>
              <TableCell className="capitalize">{quiz.difficulty}</TableCell>
              <TableCell>{quiz.questions.length}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(quiz.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/quiz/${quiz.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Practice
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
