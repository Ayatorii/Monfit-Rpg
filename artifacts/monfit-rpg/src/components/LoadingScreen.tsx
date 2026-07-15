import { motion, MotionConfig } from "framer-motion";
import { useLocation } from "wouter";
import logoImg from "@assets/06a9ab81-20e3-439e-952a-49091b8534d0_removalai_preview_1784032498122.png";
import { cn } from "@/lib/utils";

/**
 * Splash / entry screen.
 * Simplified: logo + title + single "Enter" button → /train.
 * No wallet or auth logic — this is a clean baseline for a future re-implementation.
 */
export default function LoadingScreen() {
  const [, navigate] = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden relative select-none">

        {/* ── Decorative background ── */}
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

          {/* Logo */}
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

          {/* Title */}
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

          {/* Enter button */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={() => navigate("/train")}
              className={cn(
                "w-full min-h-11 rounded-lg px-5 py-3",
                "bg-primary text-primary-foreground font-semibold",
                "transition-colors hover:bg-primary/90 active:bg-primary/80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              Enter Game
            </button>
          </motion.div>

        </div>
      </div>
    </MotionConfig>
  );
}
