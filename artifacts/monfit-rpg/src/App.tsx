import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Redirect, Route, Switch, Router as WouterRouter } from "wouter";
import AppShell from "@/components/nav/AppShell";
import { GameProvider } from "@/lib/game-context";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/components/AuthGate";
import { wagmiConfig } from "@/lib/wagmi-config";
import TrainPage from "@/pages/train";
import CharacterPage from "@/pages/character";
import ShopPage from "@/pages/shop";
import ArenaPage from "@/pages/arena";
import LeaderboardPage from "@/pages/leaderboard";

const queryClient = new QueryClient();

const rainbowKitTheme = darkTheme({
  accentColor: "hsl(249 100% 66%)",
  accentColorForeground: "hsl(0 0% 100%)",
  borderRadius: "medium",
  fontStack: undefined,
});

function Router() {
  return (
    <Switch>
      {/* Root goes straight to Train — no auth gate. */}
      <Route path="/">
        <Redirect to="/train" />
      </Route>
      <Route path="/train">
        <AppShell>
          <TrainPage />
        </AppShell>
      </Route>
      <Route path="/character">
        <AppShell>
          <CharacterPage />
        </AppShell>
      </Route>
      <Route path="/shop">
        <AppShell>
          <ShopPage />
        </AppShell>
      </Route>
      <Route path="/arena">
        <AppShell>
          <ArenaPage />
        </AppShell>
      </Route>
      <Route path="/leaderboard">
        <AppShell>
          <LeaderboardPage />
        </AppShell>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowKitTheme}>
          <TooltipProvider>
            <AuthProvider>
              <GameProvider>
                <AuthGate>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                    <Router />
                  </WouterRouter>
                </AuthGate>
                <Toaster />
              </GameProvider>
            </AuthProvider>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
