import { motion, MotionConfig } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2 } from "lucide-react";
import logoImg from "@assets/06a9ab81-20e3-439e-952a-49091b8534d0_removalai_preview_1784032498122.png";
import { cn } from "@/lib/utils";

type Props = {
  /** true while the SIWE sign-in flow is in progress. */
  isSigningIn: boolean;
  errorMessage: string | null;
  onContinueAsGuest: () => void;
};

/**
 * Entry gate. Shown until the player either finishes wallet sign-in or
 * chooses to continue as a guest.
 */
export default function LoadingScreen({ isSigningIn, errorMessage, onContinueAsGuest }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden relative select-none">
        {/* ── Version stamp ── */}
        <p
          className="absolute bottom-5 left-0 right-0 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase"
          aria-hidden="true"
        >
          v&thinsp;0.1&thinsp;ALPHA
        </p>

        {/* ── Main column ── */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[420px] px-6">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <img
              src={logoImg}
              alt="MONFIT RPG — sword and dumbbell emblem"
              width={200}
              height={200}
              decoding="async"
              className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] object-contain"
            />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-foreground leading-none text-center mb-3"
            style={{
              fontSize: "clamp(3.2rem, 13vw, 4.6rem)",
              letterSpacing: "-0.025em",
              textWrap: "balance",
            }}
          >
            MONFIT <span className="text-primary">RPG</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-muted-foreground text-sm text-center mb-10"
          >
            Connect a wallet to save your progress on Monad Testnet, or play
            as a guest.
          </motion.p>

          {/* Actions */}
          <motion.div
            className="w-full flex flex-col gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {isSigningIn ? (
              <div
                role="status"
                aria-live="polite"
                className={cn(
                  "w-full min-h-11 flex items-center justify-center gap-2 rounded-lg px-5 py-3",
                  "bg-primary text-primary-foreground font-semibold text-sm",
                )}
              >
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Confirm the signature in your wallet…
              </div>
            ) : (
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button
                    type="button"
                    onClick={openConnectModal}
                    className={cn(
                      "w-full min-h-11 rounded-lg px-5 py-3",
                      "bg-primary text-primary-foreground font-semibold text-sm",
                      "transition-colors hover:bg-primary/90 active:bg-primary/80",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
            )}

            <button
              type="button"
              onClick={onContinueAsGuest}
              disabled={isSigningIn}
              className={cn(
                "w-full min-h-11 rounded-lg border border-card-border bg-card px-5 py-3",
                "text-foreground font-semibold text-sm transition-colors",
                "hover:border-muted-foreground/40 disabled:opacity-50 disabled:pointer-events-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              Continue as Guest
            </button>

            {errorMessage && (
              <p role="alert" className="text-sm text-destructive text-center">
                {errorMessage}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
