import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, MotionConfig, useReducedMotion } from "framer-motion";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth, API_BASE } from "@/lib/auth-context";
import logoImg from "@assets/06a9ab81-20e3-439e-952a-49091b8534d0_removalai_preview_1784032498122.png";

// ─── State machine ────────────────────────────────────────────────────────────

type UIState = "checking" | "idle" | "connecting" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoadingScreen() {
  const reduced = useReducedMotion() ?? false;
  const { authMode, isCheckingSession, setGuest, setWalletAuth } = useAuth();
  const [, navigate] = useLocation();

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { signMessageAsync } = useSignMessage();
  const { openConnectModal } = useConnectModal();

  const [uiState, setUiState] = useState<UIState>("checking");
  const [statusText, setStatusText] = useState("");
  const [errorText, setErrorText] = useState("");
  // Flag: user clicked "Connect Wallet" and is waiting for the modal to resolve.
  const connectPendingRef = useRef(false);

  // ── Sync auth / session-check state into UI state ────────────────────────
  useEffect(() => {
    if (isCheckingSession) {
      setUiState("checking");
      return;
    }
    // Returning user with valid session — skip straight to Train (State 4).
    if (authMode !== null) {
      navigate("/train");
      return;
    }
    // No session — show entry UI (State 1 Idle).
    if (uiState === "checking") {
      setUiState("idle");
    }
  }, [isCheckingSession, authMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── When wallet connects (after modal), start SIWE if user initiated it ──
  useEffect(() => {
    if (isConnected && address && connectPendingRef.current) {
      connectPendingRef.current = false;
      void startSiweFlow(address);
    }
  }, [isConnected, address]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── SIWE flow ─────────────────────────────────────────────────────────────

  async function startSiweFlow(addr: string) {
    setUiState("connecting");
    setErrorText("");
    setStatusText("Waiting for signature\u2026");

    try {
      // 1. Fetch a one-time nonce from the server.
      const nonceRes = await fetch(`${API_BASE}/api/auth/nonce`, { credentials: "include" });
      if (!nonceRes.ok) throw new Error("Could not fetch nonce");
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      // 2. Construct a minimal EIP-4361 (SIWE) message.
      const domain = window.location.host;
      const uri = window.location.origin;
      const issuedAt = new Date().toISOString();
      const message =
        `${domain} wants you to sign in with your Ethereum account:\n` +
        `${addr}\n\n` +
        `Sign in to MONFIT RPG\n\n` +
        `URI: ${uri}\n` +
        `Version: 1\n` +
        `Chain ID: ${chainId ?? 1}\n` +
        `Nonce: ${nonce}\n` +
        `Issued At: ${issuedAt}`;

      // 3. Ask the wallet to sign.
      const signature = await signMessageAsync({ message });

      setStatusText("Verifying\u2026");

      // 4. Verify on the server — creates / finds the user record.
      const verifyRes = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message, signature, address: addr }),
      });
      const result = (await verifyRes.json()) as { ok?: boolean; error?: string };

      if (!verifyRes.ok || !result.ok) {
        throw new Error(result.error ?? "Verification failed");
      }

      // 5. Success — update auth context → Router redirects to /train.
      setWalletAuth(addr);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Sign-in failed";
      const isRejected =
        msg.toLowerCase().includes("rejected") ||
        msg.toLowerCase().includes("denied") ||
        msg.toLowerCase().includes("user rejected");

      setErrorText(
        isRejected
          ? "Signature declined. Try again or continue as guest."
          : "Sign-in failed. Please try again.",
      );
      setUiState("error");
      setStatusText("");
    }
  }

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function handleConnect() {
    setErrorText("");
    if (isConnected && address) {
      // Wallet already connected (browser remembered it) — go straight to SIWE.
      void startSiweFlow(address);
    } else {
      // Need to pick a wallet first.
      connectPendingRef.current = true;
      openConnectModal?.();
    }
  }

  function handleGuest() {
    setGuest();
    // authMode change triggers the useEffect above which navigates to /train.
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const isConnecting = uiState === "connecting";
  const showCta = uiState === "idle" || uiState === "error";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden relative select-none">

        {/* ── Decorative background (unchanged from Step 1) ── */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 44%, rgba(110,84,255,0.15) 0%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 40% 35% at 18% 88%, rgba(133,230,255,0.05) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, rgba(0,0,0,0.6) 100%)",
            }}
          />
        </div>

        {/* ── Version stamp ── */}
        <p
          className="absolute bottom-5 left-0 right-0 text-center font-mono text-[10px] tracking-[0.2em] text-white/60 uppercase"
          aria-hidden="true"
        >
          v&thinsp;0.1&thinsp;ALPHA
        </p>

        {/* ── Main column ── */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[420px] px-6">

          {/* Logo — entrance animation unchanged from Step 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="relative w-[200px] h-[200px] md:w-[240px] md:h-[240px] flex items-center justify-center">
              <div
                className="absolute inset-[-28%] rounded-full animate-logo-pulse"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(110,84,255,0.3) 0%, transparent 62%)",
                }}
                aria-hidden="true"
              />
              <img
                src={logoImg}
                alt="MONFIT RPG — sword and dumbbell emblem"
                width={240}
                height={240}
                decoding="async"
                className="w-full h-full object-contain relative z-10"
              />
            </div>
          </motion.div>

          {/* Title — entrance animation unchanged from Step 1 */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-white leading-none text-center mb-12"
            style={{
              fontSize: "clamp(3.6rem, 14vw, 5.2rem)",
              letterSpacing: "-0.025em",
              textWrap: "balance",
            }}
          >
            MONFIT{" "}
            <span className="text-primary">RPG</span>
          </motion.h1>

          {/* ── Action area — swaps between states ── */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <AnimatePresence mode="wait">

              {/* State 1/4 — Idle (and error recovery) */}
              {showCta && (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
                  className="flex flex-col gap-3"
                >
                  <button
                    onClick={handleConnect}
                    className={cn(
                      "w-full min-h-11 rounded-lg px-5 py-3",
                      "bg-primary text-primary-foreground font-semibold",
                      "transition-colors hover:bg-primary/90 active:bg-primary/80",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    Connect Wallet
                  </button>

                  <button
                    onClick={handleGuest}
                    className={cn(
                      "w-full min-h-11 rounded-lg px-5 py-3",
                      "text-muted-foreground font-medium",
                      "transition-colors hover:text-foreground hover:bg-white/5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    Continue as Guest
                  </button>

                  {/* Inline error message (State 1 error recovery) */}
                  <AnimatePresence>
                    {errorText && (
                      <motion.p
                        key="error"
                        role="alert"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.2, ease: "easeOut" }}
                        className="text-center text-sm text-destructive pt-1"
                      >
                        {errorText}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* State 2 — Connecting / signing */}
              {isConnecting && (
                <motion.div
                  key="connecting"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
                  className="flex flex-col items-center gap-3"
                >
                  <motion.div
                    animate={reduced ? {} : { rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                    aria-hidden="true"
                  >
                    <Loader2 className="h-6 w-6 text-primary" />
                  </motion.div>
                  <p
                    className="text-sm text-muted-foreground"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {statusText}
                  </p>
                </motion.div>
              )}

              {/* State 1 — Checking session (brief; no CTA shown) */}
              {uiState === "checking" && (
                <motion.div
                  key="checking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduced ? 0 : 0.3 }}
                  className="flex justify-center"
                >
                  <motion.div
                    animate={reduced ? {} : { rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                    aria-hidden="true"
                  >
                    <Loader2 className="h-5 w-5 text-primary/40" />
                  </motion.div>
                  <span className="sr-only">Checking session…</span>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
