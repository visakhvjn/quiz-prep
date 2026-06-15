import Link from "next/link";
import { AppBrand } from "@/components/app-sidebar";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Create a quiz", href: "/create" },
      { label: "Public quizzes", href: "/#public-quizzes" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "Interview prep", href: "/create" },
      { label: "For teachers", href: "/create" },
      { label: "Study groups", href: "/create" },
    ],
  },
];

export function AppFooter() {
  return (
    <footer className="border-t border-white/10 bg-[oklch(0.28_0.12_302)] text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10 lg:px-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="space-y-4">
            <AppBrand variant="light" />
            <p className="max-w-sm text-sm leading-relaxed text-white/70">
              AI-powered quizzes for interview prep, classrooms, and anyone who
              learns best by practicing — not just reading.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.title}>
              <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
                {group.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} QuizPrep. All rights reserved.</p>
          <p>Built for learners, teachers, and job seekers.</p>
        </div>
      </div>
    </footer>
  );
}
