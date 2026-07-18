import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { MotionConfig } from "framer-motion";
import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import AccountMenu from "@/components/nav/AccountMenu";

export default function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] bg-background text-foreground">
        {/* Desktop sidebar */}
        <nav
          role="navigation"
          aria-label="Main navigation"
          className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-r md:border-surface-border md:bg-surface md:py-6 md:px-3 md:gap-1 md:pb-4"
        >
          <div className="px-3 mb-6">
            <span className="font-display font-black text-xl tracking-tight text-foreground">
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
                  "flex items-center gap-3 rounded-md px-3 py-2.5 font-medium text-sm uppercase tracking-wide transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
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
          <div className="mt-auto pt-2">
            <AccountMenu />
          </div>
        </nav>

        {/* Mobile account strip */}
        <div className="md:hidden sticky top-0 z-10 px-4 pt-3">
          <AccountMenu />
        </div>

        {/* Main content */}
        <main id="main-content" className="md:pl-60 pb-24 md:pb-0 min-h-[100dvh]">
          {children}
        </main>

        {/* Mobile bottom nav
            Pattern: icon-only for inactive tabs, icon + shortLabel for the active tab.
            This is the standard approach for 6-item tab bars on 320–430 px screens —
            "Leaderboard" at any legible font size overflows a 53 px column (320÷6).
            Each tab is h-[54px] to guarantee a ≥44 px touch target even icon-only.
        */}
        <nav
          role="navigation"
          aria-label="Tab bar navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-surface border-t border-surface-border"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="flex items-stretch">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              const displayLabel = item.shortLabel ?? item.label;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className={cn(
                    // Equal flex columns; fixed height = guaranteed 44 px+ touch target
                    "relative flex flex-col items-center justify-center flex-1 h-[54px] transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {/* Thin indicator bar along the top edge of the active tab */}
                  {isActive && (
                    <span
                      className="absolute top-0 left-3 right-3 h-0.5 rounded-b-sm bg-primary"
                      aria-hidden="true"
                    />
                  )}

                  <Icon
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                    strokeWidth={isActive ? 2.5 : 2}
                  />

                  {isActive ? (
                    /* Active: abbreviated label visible, max 6 chars so it fits 53 px.
                       Uses text-primary-text (≥5.8:1 on surface) not text-primary (~3.9:1)
                       — the 10px size requires 4.5:1 for WCAG AA; primary-text clears it. */
                    <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide leading-none text-primary-text">
                      {displayLabel}
                    </span>
                  ) : (
                    /* Inactive: icon only — full label available to screen readers */
                    <span className="sr-only">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </MotionConfig>
  );
}
