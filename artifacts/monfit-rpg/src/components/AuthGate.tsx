import type { ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Shows the splash screen while the session is loading or when no session
 * exists. Passes through to the app for signed-in users, guests, and while
 * a mid-session wallet sign-in is in progress (header shows the signing state).
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status, continueAsGuest } = useAuth();

  if (status === "loading" || status === "signed-out") {
    return <LoadingScreen onStart={continueAsGuest} />;
  }

  // signed-in | guest | signing-in — all render the app
  return <>{children}</>;
}
