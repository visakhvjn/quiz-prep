import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { PublicQuizzesSection } from "@/components/public-quizzes-section";
import { PricingSection } from "@/components/pricing-section";
import { AppFooter } from "@/components/app-footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const USE_CASES = [
  {
    icon: Briefcase,
    tag: "Job seekers",
    title: "Nail the interview",
    body: "Most candidates don't fail because they never studied — they freeze when a question lands differently than expected. QuizPrep turns your prep list into focused practice rounds that feel closer to a real screen: one question at a time, four options, and no notes to lean on.",
    highlights: [
      "Target exactly what you're interviewing for — system design trade-offs, behavioral STAR stories, SQL, JavaScript, leadership scenarios, and more",
      "Practice under light pressure so you're rehearsing recall, not just re-reading docs",
      "See the correct answer immediately, with explanations that help you sound clear in the actual conversation",
      "Find gaps before the interview: weak subtopics show up fast when you miss the same kind of question twice",
      "Fit practice into a busy schedule — generate a 5-question drill in minutes between meetings",
    ],
    footer:
      "Whether it's your first phone screen or a final-round deep dive, showing up having already answered the hard questions once changes everything.",
    className: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    icon: GraduationCap,
    tag: "Educators",
    title: "Check understanding fast",
    body: "Spin up a review quiz for any unit and see exactly where students struggled.",
    className: "md:col-span-1",
    featured: false,
  },
  {
    icon: Users,
    tag: "Study groups",
    title: "One link, whole cohort",
    body: "Share a quiz, collect attempts, compare scores — no LMS required.",
    className: "md:col-span-1",
    featured: false,
  },
];

export function MarketingHome() {
  return (
    <div className="home-page h-full overflow-y-auto">
      {/* Hero */}
      <section className="home-hero relative overflow-hidden px-6 pb-20 pt-20 text-white sm:px-10 sm:pt-24 lg:px-14 lg:pb-28 lg:pt-24">
        <div className="home-hero-glow pointer-events-none absolute inset-0" />
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            AI quiz builder for learners & teachers
          </span>

          <h1 className="mt-8 text-[2.75rem] font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Your topics in.
            <br />
            <span className="text-white/75">Practice quizzes out.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70 sm:text-xl">
            QuizPrep helps interview candidates rehearse under pressure and helps
            teachers create assessments in minutes — not hours.
          </p>

          <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/create"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 gap-2 border-0 bg-white px-6 text-base font-semibold text-primary shadow-lg shadow-black/20 hover:bg-white/95 hover:text-primary",
              )}
            >
              Start building
            </Link>
            <a
              href="#public-quizzes"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 border border-white/40 bg-white/10 px-6 text-base text-white backdrop-blur-sm hover:bg-white/20 hover:text-white",
              )}
            >
              Explore public quizzes
            </a>
          </div>
        </div>
      </section>

      {/* Bento */}
      <section className="relative -mt-8 px-6 pb-20 sm:px-10 lg:px-14">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {USE_CASES.map((item) => (
              <div
                key={item.title}
                className={cn(
                  "home-card rounded-3xl border border-primary/10 bg-white p-6 shadow-lg shadow-primary/5 sm:p-8",
                  item.className,
                  item.featured && "home-card-featured",
                )}
              >
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase">
                  <item.icon className="size-4" />
                  {item.tag}
                </div>
                <h2
                  className={cn(
                    "mt-4 font-bold tracking-tight",
                    item.featured ? "text-2xl sm:text-3xl" : "text-xl",
                  )}
                >
                  {item.title}
                </h2>
                <p
                  className={cn(
                    "mt-3 leading-relaxed text-muted-foreground",
                    item.featured ? "text-base" : "text-sm",
                  )}
                >
                  {item.body}
                </p>
                {"highlights" in item && item.highlights ? (
                  <ul className="mt-5 space-y-2.5">
                    {item.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex gap-2.5 text-sm leading-relaxed text-foreground/85"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {"footer" in item && item.footer ? (
                  <p className="mt-5 text-sm font-medium leading-relaxed text-primary">
                    {item.footer}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicQuizzesSection />

      <PricingSection />

      {/* CTA */}
      <section className="px-6 pb-20 sm:px-10 lg:px-14">
        <div className="home-cta mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl px-8 py-12 text-center sm:flex-row sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Got five minutes?
            </h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              That&apos;s enough to generate your first quiz and see if it clicks.
            </p>
          </div>
          <Link
            href="/create"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 shrink-0 gap-2 px-6 text-base",
            )}
          >
            Create a quiz
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <AppFooter />
    </div>
  );
}
