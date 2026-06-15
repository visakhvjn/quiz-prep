import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "QuizPrep",
    template: "%s · QuizPrep",
  },
  description:
    "Create AI-powered practice quizzes for interview prep, classrooms, and study groups. Browse public quizzes or build your own in minutes.",
  applicationName: "QuizPrep",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} h-full antialiased`}
    >
      <body className="min-h-full app-gradient">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
