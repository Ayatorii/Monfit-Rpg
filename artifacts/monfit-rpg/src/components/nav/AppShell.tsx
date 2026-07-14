import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { MotionConfig } from "framer-motion";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";

export default function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-background text-foreground">
        {/* Desktop sidebar */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-r md:border-surface-border md:bg-surface md:py-6 md:px-3 md:gap-1"
        >
          <div className="px-3 mb-6">
            <span className="font-display font-black text-xl tracking-tight text-white">
              MONFIT <span className="text-primary">RPG</span>
            </span>
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-sm transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="md:pl-60 pb-24 md:pb-0 min-h-[100dvh]">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-surface-border"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch justify-around">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 flex-1 py-2.5 text-[11px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon
                    className="h-5 w-5"
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </MotionConfig>
  );
}
