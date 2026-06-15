"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AgentStatus, MarketingPanel } from "@/components/agent-status";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveQuiz } from "@/lib/quiz-store";
import { cn } from "@/lib/utils";
import type { AgentName, Difficulty, QuizStreamEvent } from "@/types/quiz";

const QUESTION_COUNTS = Array.from({ length: 6 }, (_, index) => index + 3);

export function TopicForm() {
  const router = useRouter();
  const [topics, setTopics] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentName | undefined>();
  const [completedAgents, setCompletedAgents] = useState<AgentName[]>([]);

  async function handleGenerate() {
    if (!topics.trim()) {
      setError("Enter at least one topic to practice.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setActiveAgent(undefined);
    setCompletedAgents([]);

    try {
      const response = await fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics,
          difficulty,
          questionCount: Number(questionCount),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to generate quiz");
      }

      if (!response.body) {
        throw new Error("No response stream received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const event = JSON.parse(line.slice(6)) as QuizStreamEvent;

          if (event.type === "agent_start") {
            setActiveAgent(event.agent);
          }

          if (event.type === "agent_done") {
            setCompletedAgents((current) =>
              current.includes(event.agent) ? current : [...current, event.agent],
            );
            setActiveAgent(undefined);
          }

          if (event.type === "error") {
            throw new Error(event.message);
          }

          if (event.type === "complete") {
            saveQuiz(event.quiz);
            router.push(`/quiz/${event.quiz.id}`);
            return;
          }
        }
      }
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Something went wrong",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-2">
      <section className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-lg space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-widest text-primary uppercase">
              Interview Prep
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Practice smarter with AI-built quizzes
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Enter the topics you want to drill. We&apos;ll craft a tailored
              multiple-choice session built for real interview prep.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="topics" className="text-sm font-medium">
                Topics to practice
              </label>
              <Textarea
                id="topics"
                placeholder="e.g. React hooks, system design, SQL joins, leadership stories"
                value={topics}
                onChange={(event) => setTopics(event.target.value)}
                rows={6}
                disabled={isGenerating}
                className="min-h-[140px] resize-none border-primary/15 bg-white shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Difficulty</p>
                <div className="flex flex-wrap gap-2">
                  {(["easy", "medium", "hard"] as Difficulty[]).map((level) => (
                    <Button
                      key={level}
                      type="button"
                      variant={difficulty === level ? "default" : "outline"}
                      onClick={() => setDifficulty(level)}
                      disabled={isGenerating}
                      className={cn(
                        difficulty !== level &&
                          "border-primary/20 bg-white hover:bg-accent",
                      )}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="question-count" className="text-sm font-medium">
                  Number of questions
                </label>
                <Select
                  value={questionCount}
                  onValueChange={(value) => {
                    if (value) setQuestionCount(value);
                  }}
                  disabled={isGenerating}
                >
                  <SelectTrigger
                    id="question-count"
                    className="w-full border-primary/20 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_COUNTS.map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count} questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              size="lg"
              className="h-12 w-full text-base shadow-lg shadow-primary/25"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating quiz…" : "Generate Quiz"}
            </Button>
          </div>
        </div>
      </section>

      <section className="panel-purple relative flex min-h-[320px] flex-col border-t border-white/10 lg:min-h-full lg:border-t-0 lg:border-l">
        {isGenerating ? (
          <AgentStatus
            activeAgent={activeAgent}
            completedAgents={completedAgents}
          />
        ) : (
          <MarketingPanel />
        )}
      </section>
    </div>
  );
}
