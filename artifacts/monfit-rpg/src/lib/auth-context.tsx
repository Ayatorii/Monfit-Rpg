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
import type { Address } from "viem";
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
  /**
   * Triggers the SIWE flow. If wagmi is already connected, runs SIWE directly
   * (since the isConnected effect won't re-fire). Caller should open the
   * RainbowKit modal afterwards if wagmi is NOT yet connected.
   */
  signIn: () => void;
  /** Disconnects the wallet, destroys the server session, stays in guest mode. */
  signOut: () => Promise<void>;
  /** Enters the app without a wallet — used for the "Start" button on the splash. */
  continueAsGuest: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const SIGN_TIMEOUT_MS = 30_000;

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms / 1000}s — open your wallet and try again`)),
        ms,
      ),
    ),
  ]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Tracks which address we've already run SIWE for (prevents double-firing).
  const attemptedForAddress = useRef<string | null>(null);
  // Must be set before SIWE can run — prevents wagmi's silent auto-reconnect
  // on page refresh from firing a sign request the user never asked for.
  const userInitiatedSignIn = useRef(false);
  // Set by cancel/guest paths so an in-flight SIWE doesn't overwrite state.
  const signingAborted = useRef(false);
  // Prevents the isConnected=false race after signOut() clears React state.
  const signingOut = useRef(false);

  // Mirror of status in a ref so closures inside effects/callbacks can read
  // the current value without adding status as an effect dependency.
  const statusRef = useRef<AuthStatus>("loading");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const refreshUser = useCallback(async () => {
    const session = await getAuthSession();
    setUser(session.user);
    if (session.user) setStatus("signed-in");
  }, []);

  // Hydrate any existing server session on mount.
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

  /**
   * Core SIWE runner. Called from:
   * 1. The isConnected effect, when wagmi reports a fresh user-initiated connection.
   * 2. signIn() directly, when wagmi was already auto-reconnected (effect won't
   *    re-fire because isConnected/address haven't changed since the last render).
   *
   * @param addr - The wallet address to sign for.
   * @param fallbackStatus - Where to return if signing fails or is cancelled.
   *   "guest" if the user was already inside the app; "signed-out" from splash.
   */
  const triggerSiwe = useCallback(
    async (addr: Address, fallbackStatus: AuthStatus) => {
      attemptedForAddress.current = addr;
      signingAborted.current = false;
      setStatus("signing-in");
      setError(null);

      try {
        console.log("[auth] fetching nonce for", addr);
        const { nonce } = await getAuthNonce();

        if (signingAborted.current) {
          console.log("[auth] sign aborted before signMessage");
          return;
        }

        const message = createSiweMessage({
          domain: window.location.host,
          address: addr,
          statement: "Sign in to MONFIT RPG with your wallet.",
          uri: window.location.origin,
          version: "1",
          chainId: 10143,
          nonce,
        });

        console.log(
          "[auth] calling signMessageAsync\n" +
            `  connector id:   ${connector?.id ?? "none"}\n` +
            `  connector name: ${connector?.name ?? "none"}\n` +
            `  connector type: ${connector?.type ?? "none"}`,
        );

        const signature = await withTimeout(
          signMessageAsync({ message }),
          SIGN_TIMEOUT_MS,
          "Wallet signature",
        );

        if (signingAborted.current) {
          console.log("[auth] sign aborted after signMessage");
          return;
        }

        console.log("[auth] signature received, verifying with server");
        const session = await verifyAuth({ message, signature });
        userInitiatedSignIn.current = false;

        if (signingAborted.current) return;

        setUser(session.user);
        setStatus(session.user ? "signed-in" : fallbackStatus);
        console.log("[auth] signed in as", session.user?.walletAddress);
      } catch (err) {
        userInitiatedSignIn.current = false;
        attemptedForAddress.current = null;
        const msg = err instanceof Error ? err.message : "Failed to sign in with wallet";
        console.error("[auth] SIWE error:", msg);

        if (signingAborted.current) return; // user already cancelled to guest/guest-out

        setError(msg);
        setStatus(fallbackStatus);
        disconnect();
      }
    },
    [signMessageAsync, disconnect, connector],
  );

  // Keep a stable ref to triggerSiwe so the effect below doesn't need it as a
  // dep (which would make the effect re-run whenever signMessageAsync changes).
  const triggerSiweRef = useRef(triggerSiwe);
  useEffect(() => {
    triggerSiweRef.current = triggerSiwe;
  }, [triggerSiwe]);

  // Fire SIWE when wagmi reports a wallet connection — but ONLY if the user
  // explicitly initiated it. Never on silent auto-reconnect at page load.
  useEffect(() => {
    if (!isConnected || !address) {
      signingOut.current = false;
      return;
    }
    if (signingOut.current) return;
    if (user?.walletAddress?.toLowerCase() === address.toLowerCase()) return;
    if (attemptedForAddress.current === address) return;
    if (!userInitiatedSignIn.current) {
      console.log("[auth] wallet auto-reconnected but sign-in not user-initiated");
      return;
    }

    // statusRef gives us the current status without adding it as a dep.
    const fallback: AuthStatus =
      statusRef.current === "guest" ? "guest" : "signed-out";
    triggerSiweRef.current(address, fallback);
  }, [isConnected, address, user]);

  const signIn = useCallback(() => {
    userInitiatedSignIn.current = true;
    signingAborted.current = false;
    setError(null);

    // If wagmi already has an active connection (auto-reconnect from a previous
    // session), the isConnected effect won't re-fire because its deps haven't
    // changed. We must trigger SIWE directly in that case.
    if (isConnected && address && attemptedForAddress.current !== address) {
      const fallback: AuthStatus = statusRef.current === "guest" ? "guest" : "signed-out";
      triggerSiwe(address, fallback);
    }
    // else: the caller opens the RainbowKit modal → user selects a wallet →
    // wagmi connects → isConnected/address change → effect fires → SIWE runs.
  }, [isConnected, address, triggerSiwe]);

  const signOut = useCallback(async () => {
    signingOut.current = true;
    userInitiatedSignIn.current = false;
    await logoutAuth();
    setUser(null);
    // Return to guest mode (stay inside the app), not back to the splash screen.
    setStatus("guest");
    attemptedForAddress.current = null;
    disconnect();
  }, [disconnect]);

  const continueAsGuest = useCallback(() => {
    signingAborted.current = true;
    userInitiatedSignIn.current = false;
    attemptedForAddress.current = address ?? null;
    setStatus("guest");
    setError(null);
  }, [address]);

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
