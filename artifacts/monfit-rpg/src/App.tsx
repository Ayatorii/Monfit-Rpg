import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Redirect, Route, Switch, Router as WouterRouter } from "wouter";
import LoadingScreen from "@/components/LoadingScreen";
import AppShell from "@/components/nav/AppShell";
import { GameProvider } from "@/lib/game-context";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { wagmiConfig } from "@/lib/wagmi-config";
import TrainPage from "@/pages/train";
import CharacterPage from "@/pages/character";
import ShopPage from "@/pages/shop";
import ArenaPage from "@/pages/arena";
import LeaderboardPage from "@/pages/leaderboard";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

// QueryClient must live inside WagmiProvider when using wagmi v2 + RainbowKit.
const queryClient = new QueryClient();

/**
 * Guards all inner routes behind the auth gate.
 *
 * - While the session check is in-flight → hold at a full-screen spinner so
 *   the user never sees a flash of an unprotected page.
 * - Session check done, no auth → redirect to "/" (LoadingScreen entry gate).
 * - Session check done, auth present → render the requested page normally.
 *
 * This means a browser refresh at /train (or any deep link) is always safe:
 * the user either resumes their session or is sent back to sign in.
 */
function RequireAuth({ children }: { children: ReactNode }) {
  const { authMode, isCheckingSession } = useAuth();

  if (isCheckingSession) {
    // Hold here until we know whether a valid session exists.
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 text-primary animate-spin" aria-label="Loading…" />
      </div>
    );
  }

  if (authMode === null) {
    // No session and no guest choice → back to the entry gate.
    return <Redirect to="/" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Root always shows the entry / sign-in screen. */}
      <Route path="/" component={LoadingScreen} />
      {/* Legacy /loading route redirects to root. */}
      <Route path="/loading" component={() => <Redirect to="/" />} />
      <Route path="/train">
        <RequireAuth>
          <AppShell>
            <TrainPage />
          </AppShell>
        </RequireAuth>
      </Route>
      <Route path="/character">
        <RequireAuth>
          <AppShell>
            <CharacterPage />
          </AppShell>
        </RequireAuth>
      </Route>
      <Route path="/shop">
        <RequireAuth>
          <AppShell>
            <ShopPage />
          </AppShell>
        </RequireAuth>
      </Route>
      <Route path="/arena">
        <RequireAuth>
          <AppShell>
            <ArenaPage />
          </AppShell>
        </RequireAuth>
      </Route>
      <Route path="/leaderboard">
        <RequireAuth>
          <AppShell>
            <LeaderboardPage />
          </AppShell>
        </RequireAuth>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    // WagmiProvider must be the outermost web3 wrapper.
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TooltipProvider>
            <GameProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                {/*
                 * AuthProvider lives inside WouterRouter so it can call
                 * useLocation() if needed, and so Router can read useAuth().
                 */}
                <AuthProvider>
                  <Router />
                </AuthProvider>
              </WouterRouter>
              <Toaster />
            </GameProvider>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
