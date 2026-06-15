"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AgentName } from "@/types/quiz";

export const AGENT_STEPS: {
  id: AgentName;
  headline: string;
  message: string;
}[] = [
  {
    id: "prepare",
    headline: "Building your practice plan",
    message:
      "We're shaping your topics into focused subtopics and crafting interview questions tailored to what you want to master.",
  },
  {
    id: "options",
    headline: "Making every choice count",
    message:
      "Smart distractors help you learn faster. We're building options that feel real, so you practice thinking — not guessing.",
  },
];

interface AgentStatusProps {
  activeAgent?: AgentName;
  completedAgents: AgentName[];
}

export function AgentStatus({ activeAgent, completedAgents }: AgentStatusProps) {
  const displayAgent =
    activeAgent ?? completedAgents[completedAgents.length - 1] ?? AGENT_STEPS[0].id;
  const step = AGENT_STEPS.find((item) => item.id === displayAgent) ?? AGENT_STEPS[0];
  const stepIndex = AGENT_STEPS.findIndex((item) => item.id === displayAgent);
  const progress = Math.min(
    100,
    ((completedAgents.length + (activeAgent ? 0.35 : 0)) / AGENT_STEPS.length) * 100,
  );

  return (
    <div className="flex h-full flex-col justify-center gap-6 px-6 py-8 text-white lg:gap-10 lg:px-8 lg:py-12">
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm text-white/70">
          <span>Your quiz is on the way</span>
          <span>
            {stepIndex + 1} / {AGENT_STEPS.length}
          </span>
        </div>
        <Progress
          value={progress}
          className="[&_[data-slot=progress-track]]:h-2.5 [&_[data-slot=progress-track]]:bg-white/20 [&_[data-slot=progress-indicator]]:bg-white"
        />
      </div>

      <div
        key={displayAgent}
        className={cn(
          "space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        )}
      >
        <p className="text-sm font-medium tracking-wide text-white/60 uppercase">
          {activeAgent ? "Hang tight" : "Just finished"}
        </p>
        <h3 className="text-2xl font-bold tracking-tight sm:text-4xl">
          {step.headline}
        </h3>
        <p className="max-w-md text-lg leading-relaxed text-white/80">
          {step.message}
        </p>
        {activeAgent && (
          <div className="flex items-center gap-2 pt-2 text-sm text-white/60">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-white" />
            Working on it…
          </div>
        )}
      </div>
    </div>
  );
}

const MARKETING_HIGHLIGHTS = [
  {
    title: "Practice with purpose",
    body: "Every quiz is built around the topics you care about — not a generic question bank.",
  },
  {
    title: "Learn from every answer",
    body: "Clear explanations help you walk into interviews sounding prepared, not memorized.",
  },
  {
    title: "Ready in minutes",
    body: "Type your topics, pick your level, and start practicing before self-doubt kicks in.",
  },
];

export function MarketingPanel() {
  return (
    <div className="flex h-full flex-col justify-center gap-10 px-8 py-12">
      <div className="space-y-4">
        <p className="text-sm font-medium tracking-wide text-white/60 uppercase">
          Why QuizPrep
        </p>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Walk in confident.
          <br />
          Walk out proud.
        </h2>
        <p className="max-w-md text-lg leading-relaxed text-white/75">
          Interviews reward clarity under pressure.
        </p>
      </div>

      <div className="space-y-4">
        {MARKETING_HIGHLIGHTS.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4"
          >
            <p className="font-semibold text-white">{item.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
