"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, X } from "lucide-react";
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
import { apiFetch } from "@/lib/api-client";
import { notifyQuizListChanged } from "@/lib/quiz-events";
import { getQuestionCountRange } from "@/lib/plans";
import { useAccount } from "@/lib/use-account";
import { cn } from "@/lib/utils";
import type { AgentName, Difficulty, QuizStreamEvent } from "@/types/quiz";

export function TopicForm() {
  const router = useRouter();
  const { account, isLoading: isAccountLoading } = useAccount();
  const questionCounts = useMemo(
    () => getQuestionCountRange(account.plan),
    [account.plan],
  );

  const [topics, setTopics] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState("5");
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentName | undefined>();
  const [completedAgents, setCompletedAgents] = useState<AgentName[]>([]);

  const maxQuestions = account.limits.maxQuestions;
  const effectiveQuestionCount = questionCounts.includes(Number(questionCount))
    ? questionCount
    : String(maxQuestions);

  async function handleDocumentUpload(file: File) {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiFetch("/api/quiz/extract-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to upload document");
      }

      const payload = (await response.json()) as {
        fileName: string;
        text: string;
      };

      setSourceMaterial(payload.text);
      setUploadedFileName(payload.fileName);
    } catch (uploadError) {
      setSourceMaterial("");
      setUploadedFileName(null);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload document",
      );
    } finally {
      setIsUploading(false);
    }
  }

  function clearDocument() {
    setSourceMaterial("");
    setUploadedFileName(null);
  }

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
      const response = await apiFetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topics,
          difficulty,
          questionCount: Number(effectiveQuestionCount),
          ...(sourceMaterial ? { sourceMaterial } : {}),
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
            notifyQuizListChanged();
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
    <div className="grid h-full min-h-0 w-full lg:grid-cols-2">
      <section className="flex flex-col justify-center overflow-y-auto px-6 py-12 sm:px-10 lg:px-14">
        <div className="mx-auto w-full max-w-lg space-y-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium tracking-widest text-primary uppercase">
                Interview Prep
              </p>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium capitalize text-primary">
                {isAccountLoading ? "…" : `${account.plan} plan`}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Practice smarter with AI-built quizzes
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Enter the topics you want to drill. We&apos;ll craft a tailored
              multiple-choice session using {account.limits.modelLabel.toLowerCase()}.
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

            {account.limits.documentUpload ? (
              <div className="space-y-2">
                <label htmlFor="source-document" className="text-sm font-medium">
                  Source document (optional)
                </label>
                <p className="text-xs text-muted-foreground">
                  Upload a PDF, TXT, or Markdown file to generate questions from
                  your own material.
                </p>
                {uploadedFileName ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="truncate text-sm font-medium">
                        {uploadedFileName}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={clearDocument}
                      disabled={isGenerating || isUploading}
                      aria-label="Remove document"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <input
                    id="source-document"
                    type="file"
                    accept=".pdf,.txt,.md,text/plain,text/markdown,application/pdf"
                    disabled={isGenerating || isUploading}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleDocumentUpload(file);
                      event.target.value = "";
                    }}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                  />
                )}
                {isUploading ? (
                  <p className="text-xs text-muted-foreground">
                    Reading document…
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                Upgrade to Premium to upload PDFs and docs for quiz generation.{" "}
                <a href="/#pricing" className="font-medium text-primary hover:underline">
                  See pricing
                </a>
              </div>
            )}

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
                  value={effectiveQuestionCount}
                  onValueChange={(value) => {
                    if (value) setQuestionCount(value);
                  }}
                  disabled={isGenerating || isAccountLoading}
                >
                  <SelectTrigger
                    id="question-count"
                    className="w-full border-primary/20 bg-white"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionCounts.map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count} questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Up to 5 questions per quiz.
                </p>
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
              disabled={isGenerating || isUploading}
            >
              {isGenerating ? "Generating quiz…" : "Generate Quiz"}
            </Button>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "panel-purple relative flex flex-col border-t border-white/10",
          isGenerating
            ? "h-auto lg:h-full lg:min-h-0 lg:border-t-0 lg:border-l"
            : "hidden lg:h-full lg:min-h-0 lg:flex lg:border-l",
        )}
      >
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
