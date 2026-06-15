"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiFetch } from "@/lib/api-client";
import { notifyQuizListChanged } from "@/lib/quiz-events";
import type { Quiz, QuizVisibility } from "@/types/quiz";

interface QuizSettingsPanelProps {
  quiz: Quiz;
  onSaved: (quiz: Quiz) => void;
}

export function QuizSettingsPanel({ quiz, onSaved }: QuizSettingsPanelProps) {
  const [visibility, setVisibility] = useState<QuizVisibility>(quiz.visibility);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setVisibility(quiz.visibility);
  }, [quiz.visibility]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/quiz/${quiz.id}/play`);
  }, [quiz.id]);

  async function handleVisibilityChange(checked: boolean) {
    const nextVisibility: QuizVisibility = checked ? "public" : "private";
    setVisibility(nextVisibility);
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await apiFetch(`/api/quiz/${quiz.id}`, {
        method: "PATCH",
        body: JSON.stringify({ visibility: nextVisibility }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      const payload = (await response.json()) as { quiz: Quiz };
      onSaved(payload.quiz);
      notifyQuizListChanged();
      setMessage(
        nextVisibility === "public"
          ? "Quiz is now public on the homepage."
          : "Quiz is now private. Only people with the link can access it.",
      );
    } catch (error) {
      setVisibility(quiz.visibility);
      setMessage(
        error instanceof Error ? error.message : "Failed to update settings",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setMessage("Share link copied.");
  }

  return (
    <div className="max-w-xl space-y-8">
      <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="publish-toggle" className="text-base">
              Publish quiz
            </Label>
            <p className="text-sm text-muted-foreground">
              Public quizzes appear on the homepage. Private quizzes can only
              be opened by people with the link.
            </p>
          </div>
          <Switch
            id="publish-toggle"
            checked={visibility === "public"}
            disabled={isSaving}
            onCheckedChange={handleVisibilityChange}
          />
        </div>

        <div className="mt-4">
          <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {visibility === "public" ? "Public" : "Private"}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="share-link">Share link</Label>
          <p className="text-sm text-muted-foreground">
            Send this link so people can take the quiz.
          </p>
          <div className="flex gap-2">
            <Input id="share-link" readOnly value={shareUrl} />
            <Button type="button" variant="outline" onClick={copyLink}>
              Copy
            </Button>
          </div>
        </div>
      </div>

      {message ? <p className="text-sm text-primary">{message}</p> : null}
    </div>
  );
}
