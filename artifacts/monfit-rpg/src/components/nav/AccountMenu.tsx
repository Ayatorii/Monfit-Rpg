import { Wallet2, LogOut, Loader2 } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Persistent wallet widget shown in the sidebar (desktop) and top strip (mobile).
 *
 * States:
 *   guest / (no session)  → "Connect Wallet" button → opens RainbowKit modal + SIWE
 *   signing-in            → spinner + "Cancel" button
 *   signed-in             → shortened address + disconnect
 */
export default function AccountMenu({ className }: { className?: string }) {
  const { status, walletAddress, signIn, signOut, continueAsGuest, error } = useAuth();
  const { isConnected: wagmiConnected } = useAccount();

  // ── Signed in ──────────────────────────────────────────────────────────────
  if (status === "signed-in" && walletAddress) {
    return (
      <div className={cn("flex items-center gap-2 rounded-md px-3 py-2.5 bg-white/5", className)}>
        <Wallet2 className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
        <span className="flex-1 min-w-0 font-mono text-xs text-foreground truncate">
          {shortenAddress(walletAddress)}
        </span>
        <button
          type="button"
          onClick={signOut}
          aria-label="Disconnect wallet"
          className={cn(
            "shrink-0 rounded p-1.5 text-muted-foreground transition-colors",
            "hover:text-foreground hover:bg-white/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  // ── SIWE in progress ───────────────────────────────────────────────────────
  if (status === "signing-in") {
    return (
      <div className={cn("flex items-center gap-2 rounded-md px-3 py-2.5 bg-white/5", className)}>
        <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" aria-hidden="true" />
        <span className="flex-1 min-w-0 text-xs text-muted-foreground truncate">
          Confirm in wallet…
        </span>
        <button
          type="button"
          onClick={continueAsGuest}
          aria-label="Cancel sign-in"
          className={cn(
            "shrink-0 rounded p-1.5 text-muted-foreground transition-colors",
            "hover:text-foreground hover:bg-white/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          )}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  // ── Guest (not signed in) ──────────────────────────────────────────────────
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <ConnectButton.Custom>
        {({ openConnectModal }) => (
          <button
            type="button"
            onClick={() => {
              signIn(); // arms the flag; if already connected, fires SIWE directly
              if (!wagmiConnected) openConnectModal(); // open modal only when needed
            }}
            className={cn(
              "flex items-center gap-2 w-full rounded-md px-3 py-2.5",
              "bg-primary/10 text-primary font-medium text-xs transition-colors",
              "hover:bg-primary/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            )}
          >
            <Wallet2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Connect Wallet
          </button>
        )}
      </ConnectButton.Custom>

      {error && (
        <p className="px-3 text-[11px] text-destructive leading-snug">{error}</p>
      )}
    </div>
  );
}
