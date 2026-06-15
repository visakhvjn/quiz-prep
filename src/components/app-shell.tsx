"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppBrand, AppSidebar, SidebarToggleButton } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const showSidebar = pathname === "/create";
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!showSidebar) {
      setCollapsed(true);
      setMobileOpen(false);
    }
  }, [showSidebar]);

  function closeSidebar() {
    setCollapsed(true);
    setMobileOpen(false);
  }

  function closeMobile() {
    setMobileOpen(false);
  }

  function handleSidebarToggle() {
    if (isDesktop) {
      setCollapsed((value) => !value);
      return;
    }
    setMobileOpen((value) => !value);
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      {showSidebar ? (
        <>
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
              onNavigate={closeMobile}
              onNewQuiz={closeSidebar}
            />
          </div>
        </>
      ) : null}

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <header
          className={cn(
            "z-20 flex h-14 shrink-0 items-center gap-3 border-transparent bg-transparent px-4",
            isHomePage && "absolute inset-x-0 top-0",
          )}
        >
          {showSidebar ? (
            <SidebarToggleButton
              collapsed={isDesktop ? collapsed : !mobileOpen}
              onToggle={handleSidebarToggle}
            />
          ) : null}
          <AppBrand onNavigate={closeMobile} variant={isHomePage ? "light" : "default"} />
        </header>

        <main className="relative min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
