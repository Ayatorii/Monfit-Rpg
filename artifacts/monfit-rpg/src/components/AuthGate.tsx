import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Gates the rest of the app behind wallet sign-in or an explicit "continue
 * as guest" choice. Guests keep playing with client-only state (see
 * game-context.tsx); signed-in wallets get server-persisted progress.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status, error, signIn, continueAsGuest } = useAuth();

  if (status === "signed-in" || status === "guest") {
    return <>{children}</>;
  }

  return (
    <LoadingScreen
      isSigningIn={status === "signing-in"}
      errorMessage={error}
      onSignIn={signIn}
      onContinueAsGuest={continueAsGuest}
    />
  );
}
