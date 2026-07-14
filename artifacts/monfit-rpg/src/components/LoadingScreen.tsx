import { useState, useEffect } from "react";
import { motion, MotionConfig } from "framer-motion";
import logoImg from "@assets/06a9ab81-20e3-439e-952a-49091b8534d0_removalai_preview_1784032498122.png";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  // JS-driven progress — aria-valuenow updates live
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return Math.min(100, p + Math.random() * 2.2 + 0.6);
      });
    }, 55);
    return () => clearInterval(id);
  }, []);

  const pct = Math.round(progress);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background overflow-hidden relative select-none">

        {/* ── Background: violet bloom + cyan ghost + vignette ── */}
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
          className="absolute bottom-5 right-5 font-mono text-[10px] tracking-[0.2em] text-primary/20 uppercase"
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
              {/* Breathing halo */}
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
                className="w-full h-full object-contain relative z-10"
              />
            </div>
          </motion.div>

          {/* Title — Barlow Condensed Black */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-black text-white leading-none text-center mb-14"
            style={{
              fontSize: "clamp(3.6rem, 14vw, 5.2rem)",
              letterSpacing: "-0.025em",
              textWrap: "balance",
            }}
          >
            MONFIT{" "}
            <span className="text-primary">RPG</span>
          </motion.h1>

          {/* Load bar — corner-bracket frame */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            {/* Percentage */}
            <div className="flex justify-center mb-[7px]">
              <span className="font-mono text-[11px] text-white/80 tabular-nums">
                {pct}%
              </span>
            </div>

            {/* Bar track */}
            <div
              role="progressbar"
              aria-label="Loading MONFIT RPG"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              className="relative w-full h-[6px] rounded-full overflow-hidden"
              style={{
                background: "rgba(110,84,255,0.1)",
                border: "1px solid rgba(110,84,255,0.2)",
              }}
            >
              {/* Fill */}
              <div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  transition: "width 55ms linear",
                  background: "hsl(var(--primary))",
                  boxShadow:
                    "0 0 10px rgba(110,84,255,0.7), 0 0 2px rgba(133,230,255,0.35)",
                }}
              >
                {/* Shimmer */}
                <div className="absolute inset-0 animate-shimmer-sweep overflow-hidden rounded-full">
                  <div className="w-[38%] h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-25 -skew-x-12" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
