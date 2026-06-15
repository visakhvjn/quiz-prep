"use client";

import { useState } from "react";
import { AppSidebar, SidebarToggleButton } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  function closeSidebar() {
    setCollapsed(true);
    setMobileOpen(false);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobile}
        aria-hidden={!mobileOpen}
      />

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "transition-transform duration-200",
        )}
      >
        <AppSidebar
          collapsed={collapsed && !mobileOpen}
          onToggle={() => setCollapsed((value) => !value)}
          onNavigate={closeMobile}
          onNewQuiz={closeSidebar}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-primary/10 bg-white/90 px-4 backdrop-blur-md lg:hidden">
          <SidebarToggleButton
            collapsed={!mobileOpen}
            onToggle={() => setMobileOpen((value) => !value)}
          />
          <span className="font-semibold">QuizPrep</span>
        </header>

        {collapsed && (
          <div className="absolute left-3 top-3 z-30 hidden lg:block">
            <SidebarToggleButton
              collapsed={collapsed}
              onToggle={() => setCollapsed(false)}
            />
          </div>
        )}

        <main className="relative min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
