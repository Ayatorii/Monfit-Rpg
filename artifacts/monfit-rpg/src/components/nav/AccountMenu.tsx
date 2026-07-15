import { Wallet2, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/**
 * Wallet identity + sign-out affordance. Renders nothing for guests — they
 * have no session to show or clear.
 */
export default function AccountMenu({ className }: { className?: string }) {
  const { status, walletAddress, signOut } = useAuth();

  if (status !== "signed-in" || !walletAddress) return null;

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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
        )}
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
