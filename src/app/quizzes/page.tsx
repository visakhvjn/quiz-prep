import type { Metadata } from "next";
import { QuizzesTable } from "@/components/quizzes-table";

export const metadata: Metadata = {
  title: "All Quizzes",
};

export default function QuizzesPage() {
  return (
    <main className="flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All generated quizzes</h1>
          <p className="mt-2 text-muted-foreground">
            Pick up where you left off or revisit a past practice session.
          </p>
        </div>
        <QuizzesTable />
      </div>
    </main>
  );
}
