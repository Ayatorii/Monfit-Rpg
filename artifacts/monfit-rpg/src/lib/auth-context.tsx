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

const SIGN_TIMEOUT_MS = 30_000;

/** Races signMessageAsync against a timeout so a hung wallet doesn't freeze the UI. */
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

  const attemptedForAddress = useRef<string | null>(null);

  // Guards the SIWE effect from firing between signOut() clearing React state
  // and wagmi propagating isConnected=false.
  const signingOut = useRef(false);

  // Only run SIWE after the user explicitly clicked "Connect Wallet".
  // Prevents wagmi's silent auto-reconnect on page refresh from triggering
  // an automatic sign request that the user never asked for.
  const userInitiatedSignIn = useRef(false);

  // Set by continueAsGuest() while a SIWE is in-flight so the async callback
  // doesn't overwrite the "guest" status when it eventually resolves/rejects.
  const signingAborted = useRef(false);

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
  // matching session yet — BUT only if the user explicitly initiated it.
  useEffect(() => {
    if (!isConnected || !address) {
      // Wagmi confirmed disconnect — safe to allow the next sign-in attempt.
      signingOut.current = false;
      return;
    }
    if (signingOut.current) return;
    if (user?.walletAddress.toLowerCase() === address.toLowerCase()) return;
    if (attemptedForAddress.current === address) return;

    // ── Guard: don't auto-fire on wagmi's silent reconnect on page refresh ──
    // The user must have clicked "Connect Wallet" (which sets this flag) to
    // trigger the sign request. Without this, every page load that finds a
    // previously-connected wallet immediately pops a signature request that
    // the user never asked for and that the wallet extension may silently drop.
    if (!userInitiatedSignIn.current) {
      console.log("[auth] wallet auto-reconnected but sign-in not user-initiated — staying on connect screen");
      return;
    }

    attemptedForAddress.current = address;
    signingAborted.current = false;
    setStatus("signing-in");
    setError(null);

    (async () => {
      try {
        console.log("[auth] fetching nonce for", address);
        const { nonce } = await getAuthNonce();

        if (signingAborted.current) {
          console.log("[auth] sign aborted before signMessage — stopping");
          return;
        }

        const message = createSiweMessage({
          domain: window.location.host,
          address,
          statement: "Sign in to MONFIT RPG with your wallet.",
          uri: window.location.origin,
          version: "1",
          chainId: 10143,
          nonce,
        });

        console.log(
          "[auth] calling signMessageAsync — wallet popup should appear now\n" +
          `  connector id:   ${connector?.id ?? "none"}\n` +
          `  connector name: ${connector?.name ?? "none"}\n` +
          `  connector type: ${connector?.type ?? "none"}\n` +
          `  window.ethereum: ${(window as any).ethereum?.constructor?.name ?? typeof (window as any).ethereum}`,
        );

        const signature = await withTimeout(
          signMessageAsync({ message }),
          SIGN_TIMEOUT_MS,
          "Wallet signature",
        );

        console.log("[auth] signature received, verifying with server");

        if (signingAborted.current) {
          console.log("[auth] sign aborted after signMessage — stopping");
          return;
        }

        const session = await verifyAuth({ message, signature });
        userInitiatedSignIn.current = false;

        if (signingAborted.current) return;

        setUser(session.user);
        setStatus(session.user ? "signed-in" : "signed-out");
        console.log("[auth] signed in as", session.user?.walletAddress);
      } catch (err) {
        userInitiatedSignIn.current = false;
        attemptedForAddress.current = null;
        const message = err instanceof Error ? err.message : "Failed to sign in with wallet";
        console.error("[auth] SIWE error:", message);

        if (signingAborted.current) {
          console.log("[auth] already in guest mode — ignoring sign error");
          return;
        }

        setError(message);
        setStatus("signed-out");
        disconnect();
      }
    })();
  }, [isConnected, address, user, signMessageAsync, disconnect]);

  const signIn = useCallback(() => {
    // Mark as user-initiated so the SIWE effect is allowed to run.
    // Wallet connection is triggered by RainbowKit's <ConnectButton /> in the
    // UI; this just arms the flag and clears any previous error.
    userInitiatedSignIn.current = true;
    setError(null);
  }, []);

  const signOut = useCallback(async () => {
    signingOut.current = true;
    userInitiatedSignIn.current = false;
    await logoutAuth();
    setUser(null);
    setStatus("signed-out");
    attemptedForAddress.current = null;
    disconnect();
  }, [disconnect]);

  const continueAsGuest = useCallback(() => {
    // Abort any in-flight SIWE so it doesn't overwrite status when it lands.
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
