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
import { AuthProvider } from "@/lib/auth-context";
import { wagmiConfig } from "@/lib/wagmi-config";
import TrainPage from "@/pages/train";
import CharacterPage from "@/pages/character";
import ShopPage from "@/pages/shop";
import ArenaPage from "@/pages/arena";
import LeaderboardPage from "@/pages/leaderboard";

// QueryClient must live inside WagmiProvider when using wagmi v2 + RainbowKit.
const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Root always shows the entry / sign-in screen. */}
      <Route path="/" component={LoadingScreen} />
      {/* Legacy /loading route redirects to root. */}
      <Route path="/loading" component={() => <Redirect to="/" />} />
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
