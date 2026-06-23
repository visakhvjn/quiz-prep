"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { notifyQuizListChanged } from "@/lib/quiz-events";
import { cn } from "@/lib/utils";
import type { Quiz, QuizQuestion } from "@/types/quiz";

interface QuizQuestionsEditorProps {
  quiz: Quiz;
  onSaved: (quiz: Quiz) => void;
}

export function QuizQuestionsEditor({ quiz, onSaved }: QuizQuestionsEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(quiz.questions);
  const [topics, setTopics] = useState(quiz.topics);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setQuestions(quiz.questions);
    setTopics(quiz.topics);
  }, [quiz]);

  function updateQuestion(
    index: number,
    patch: Partial<QuizQuestion> | ((question: QuizQuestion) => QuizQuestion),
  ) {
    setQuestions((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index) return question;
        return typeof patch === "function"
          ? patch(question)
          : { ...question, ...patch };
      }),
    );
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await apiFetch(`/api/quiz/${quiz.id}`, {
        method: "PATCH",
        body: JSON.stringify({ topics, questions }),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz");
      }

      const payload = (await response.json()) as { quiz: Quiz };
      onSaved(payload.quiz);
      notifyQuizListChanged();
      setMessage("Changes saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="quiz-topics">Source topics</Label>
        <p className="text-xs text-muted-foreground">
          The raw topics you entered when creating this quiz.
        </p>
        <Input
          id="quiz-topics"
          value={topics}
          onChange={(event) => setTopics(event.target.value)}
        />
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="rounded-xl border border-primary/10 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <p className="text-sm font-medium text-primary">
                Question {index + 1}
              </p>
              <Input
                value={question.subtopic}
                onChange={(event) =>
                  updateQuestion(index, { subtopic: event.target.value })
                }
                className="w-full sm:max-w-xs"
                placeholder="Subtopic"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Question</Label>
                <Textarea
                  value={question.question}
                  onChange={(event) =>
                    updateQuestion(index, { question: event.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Answer options</Label>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuestion(index, { correctIndex: optionIndex })
                        }
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                          question.correctIndex === optionIndex
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-primary/20 text-muted-foreground hover:border-primary/40",
                        )}
                        aria-label={`Mark option ${optionIndex + 1} as correct`}
                      >
                        {String.fromCharCode(65 + optionIndex)}
                      </button>
                      <Input
                        value={option}
                        onChange={(event) =>
                          updateQuestion(index, (current) => ({
                            ...current,
                            options: current.options.map((value, currentIndex) =>
                              currentIndex === optionIndex
                                ? event.target.value
                                : value,
                            ),
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Click a letter to mark the correct answer.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Explanation</Label>
                <Textarea
                  value={question.explanation ?? ""}
                  onChange={(event) =>
                    updateQuestion(index, { explanation: event.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="h-12 w-full text-base sm:w-auto"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
        {message && (
          <p
            className={cn(
              "text-sm",
              message.includes("saved")
                ? "text-primary"
                : "text-destructive",
            )}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
