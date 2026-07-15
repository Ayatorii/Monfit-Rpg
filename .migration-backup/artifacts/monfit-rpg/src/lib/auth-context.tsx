import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";
import { createSiweMessage } from "viem/siwe";
import {
  getAuthNonce,
  getAuthSession,
  logoutAuth,
  verifyAuth,
} from "@workspace/api-client-react";
import type { AuthUser } from "@workspace/api-client-react";

type AuthStatus = "loading" | "signed-out" | "signing-in" | "signed-in" | "guest";

type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  /** Wallet address from the active session (lowercased), or null. */
  walletAddress: string | null;
  error: string | null;
  /** Opens the wallet connect UI and, once connected, runs the SIWE flow. */
  signIn: () => void;
  /** Disconnects the wallet and destroys the server session. */
  signOut: () => Promise<void>;
  /** Dismisses the connect gate without a wallet — plays as a guest. */
  continueAsGuest: () => void;
  /** Refetches the current session's player/user data from the server. */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attemptedForAddress = useRef<string | null>(null);
  // Guards the SIWE effect from firing between signOut() clearing React state
  // and wagmi propagating isConnected=false.  Without this, setUser(null)
  // triggers the effect while the wallet is still technically "connected" in
  // wagmi's view, causing signMessageAsync to throw "Connector not connected".
  const signingOut = useRef(false);

  const refreshUser = useCallback(async () => {
    const session = await getAuthSession();
    setUser(session.user);
    if (session.user) {
      setStatus("signed-in");
    }
  }, []);

  // Hydrate any existing session on first load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await getAuthSession();
        if (cancelled) return;
        setUser(session.user);
        setStatus(session.user ? "signed-in" : "signed-out");
      } catch {
        if (!cancelled) setStatus("signed-out");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Run the SIWE flow whenever a wallet connects and we don't have a
  // matching session yet.
  useEffect(() => {
    if (!isConnected || !address) {
      // Wagmi confirmed disconnect — safe to allow the next sign-in attempt.
      signingOut.current = false;
      return;
    }
    // signOut() sets this before clearing React state so the effect doesn't
    // fire between "user cleared" and "wagmi isConnected=false".
    if (signingOut.current) return;
    if (user?.walletAddress.toLowerCase() === address.toLowerCase()) return;
    if (attemptedForAddress.current === address) return;

    attemptedForAddress.current = address;
    setStatus("signing-in");
    setError(null);

    (async () => {
      try {
        const { nonce } = await getAuthNonce();
        const message = createSiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in to MONFIT RPG with your wallet.",
          uri: window.location.origin,
          version: "1",
          chainId: 10143,
          nonce,
        });
        const signature = await signMessageAsync({ message });
        const session = await verifyAuth({ message, signature });
        setUser(session.user);
        setStatus(session.user ? "signed-in" : "signed-out");
      } catch (err) {
        attemptedForAddress.current = null;
        setError(err instanceof Error ? err.message : "Failed to sign in with wallet");
        setStatus("signed-out");
        disconnect();
      }
    })();
  }, [isConnected, address, user, signMessageAsync, disconnect]);

  const signIn = useCallback(() => {
    // Wallet connection is triggered by RainbowKit's <ConnectButton /> in the
    // UI; this just clears any previous error so the retry is visible.
    setError(null);
  }, []);

  const signOut = useCallback(async () => {
    // Set before any state changes so the SIWE effect is suppressed during the
    // window between setUser(null) re-rendering and wagmi propagating
    // isConnected=false.  Cleared inside the SIWE effect when disconnect lands.
    signingOut.current = true;
    await logoutAuth();
    setUser(null);
    setStatus("signed-out");
    attemptedForAddress.current = null;
    disconnect();
  }, [disconnect]);

  const continueAsGuest = useCallback(() => {
    setStatus("guest");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        walletAddress: user?.walletAddress ?? null,
        error,
        signIn,
        signOut,
        continueAsGuest,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
