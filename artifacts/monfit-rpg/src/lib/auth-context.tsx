import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export const API_BASE = "";

export type AuthMode = "wallet" | "guest" | null;

interface AuthContextValue {
  authMode: AuthMode;
  walletAddress: string | null;
  /** True while the initial session check is in flight on page load. */
  isCheckingSession: boolean;
  setGuest: () => void;
  setWalletAuth: (address: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check for an existing valid server session on mount (State 4 — returning user).
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/session`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: { authenticated: boolean; address?: string }) => {
        if (data.authenticated && data.address) {
          setWalletAddress(data.address);
          setAuthMode("wallet");
        }
      })
      .catch(() => {
        // Network error or server down — treat as unauthenticated, show entry screen.
      })
      .finally(() => setIsCheckingSession(false));
  }, []);

  const setGuest = () => setAuthMode("guest");

  const setWalletAuth = (address: string) => {
    setWalletAddress(address);
    setAuthMode("wallet");
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // Best-effort logout
    }
    setAuthMode(null);
    setWalletAddress(null);
  };

  return (
    <AuthContext.Provider
      value={{ authMode, walletAddress, isCheckingSession, setGuest, setWalletAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
