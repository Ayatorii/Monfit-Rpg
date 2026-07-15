import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Redirect, Route, Switch, Router as WouterRouter } from "wouter";
import AppShell from "@/components/nav/AppShell";
import { GameProvider } from "@/lib/game-context";
import TrainPage from "@/pages/train";
import CharacterPage from "@/pages/character";
import ShopPage from "@/pages/shop";
import ArenaPage from "@/pages/arena";
import LeaderboardPage from "@/pages/leaderboard";

const queryClient = new QueryClient();

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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
