import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Navbar } from "@/components/navbar";
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
    "Generate AI-powered interview practice quizzes tailored to your topics.",
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
      <body className="min-h-full flex flex-col app-gradient">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
