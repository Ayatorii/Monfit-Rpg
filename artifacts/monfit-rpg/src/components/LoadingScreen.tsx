import { motion, MotionConfig } from "framer-motion";
import logoImg from "@assets/06a9ab81-20e3-439e-952a-49091b8534d0_removalai_preview_1784032498122.png";
import { cn } from "@/lib/utils";

type Props = {
  /** Called when the user clicks "Start" — enters the app in guest mode. */
  onStart: () => void;
};

/**
 * Splash screen shown on first load (or after sign-out).
 * No wallet logic here — wallet connect lives in the app header.
 */
export default function LoadingScreen({ onStart }: Props) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden relative select-none">
        {/* Version stamp */}
        <p
          className="absolute bottom-5 left-0 right-0 text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase"
          aria-hidden="true"
        >
          v&thinsp;0.1&thinsp;ALPHA
        </p>

        {/* Main column */}
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
            Train. Fight. Earn. Your progress lives on Monad Testnet.
          </motion.p>

          {/* Start button */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={onStart}
              className={cn(
                "w-full min-h-11 rounded-lg px-5 py-3",
                "bg-primary text-primary-foreground font-semibold text-sm",
                "transition-colors hover:bg-primary/90 active:bg-primary/80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
            >
              Start
            </button>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
