import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "hobby",
    name: "Hobby",
    price: "Free",
    period: "forever",
    description: "Perfect for quick interview drills and trying QuizPrep out.",
    features: [
      "Up to 5 questions per quiz",
      "Standard AI models",
      "Topic-based generation",
      "Private & public sharing",
      "Attempt tracking",
    ],
    cta: "Start for free",
    href: "/create",
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "Coming soon",
    period: "billing",
    description: "Build richer quizzes from your own material with advanced AI.",
    features: [
      "Advanced AI models",
      "Upload PDFs, notes & docs to generate quizzes",
      "Ground questions in your source material",
      "Everything in Hobby",
    ],
    cta: "Join waitlist",
    href: "/create",
    highlighted: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-8 border-t border-primary/10 bg-white/50 px-6 py-20 sm:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-medium tracking-widest text-primary uppercase">
            Pricing
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Start free. Go deeper when you need to.
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Hobby covers fast practice runs. Premium unlocks document uploads and
            longer quizzes built from your own study guides and syllabi.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-3xl border p-8 shadow-sm",
                plan.highlighted
                  ? "border-primary bg-white shadow-lg shadow-primary/10"
                  : "border-primary/10 bg-white",
              )}
            >
              {plan.highlighted ? (
                <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Most powerful
                </span>
              ) : null}

              <div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-6 flex items-end gap-2">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period ? (
                    <span className="pb-1 text-sm text-muted-foreground">
                      / {plan.period}
                    </span>
                  ) : null}
                </div>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  buttonVariants({
                    variant: plan.highlighted ? "default" : "outline",
                    size: "lg",
                  }),
                  "mt-8 h-12 w-full text-base",
                )}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
