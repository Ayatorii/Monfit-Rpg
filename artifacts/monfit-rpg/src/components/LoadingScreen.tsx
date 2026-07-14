import { useState, useEffect } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import logoImg from "@assets/06a9ab81-20e3-439e-952a-49091b8534d0_removalai_preview_1784032498122.png";

const FLAVOR_TEXTS = [
  "Sharpening the sword...",
  "Counting your steps...",
  "Loading the dungeon...",
  "Brewing recovery potions...",
  "Summoning your trainer...",
];

export default function LoadingScreen() {
  const [flavorIndex, setFlavorIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlavorIndex((prev) => (prev + 1) % FLAVOR_TEXTS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    // MotionConfig reducedMotion="user" tells framer-motion to respect OS setting
    <MotionConfig reducedMotion="user">
      <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 overflow-hidden relative">
        {/* Ambient background glow — radial-gradient instead of blur-[100px] */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(110,84,255,0.1) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center w-full max-w-[400px]">
          {/* Logo and Title Group */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            {/* Logo Image */}
            <div className="relative w-[140px] h-[140px] md:w-[200px] md:h-[200px] mb-6 flex items-center justify-center">
              {/* Logo glow — radial-gradient instead of blur-2xl */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(110,84,255,0.25) 0%, transparent 70%)",
                }}
                aria-hidden="true"
              />
              <img
                src={logoImg}
                alt="MONFIT RPG — sword and dumbbell emblem"
                role="img"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(110,84,255,0.5)]"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-wider text-white text-center drop-shadow-[0_0_10px_rgba(110,84,255,0.3)] mb-2">
              MONFIT{" "}
              <span className="text-primary drop-shadow-[0_0_12px_rgba(110,84,255,0.8)]">
                RPG
              </span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base font-medium uppercase tracking-[0.2em] mb-12 text-center">
              Train. Level Up. Conquer.
            </p>
          </motion.div>

          {/* Loading Bar Group */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="w-full flex flex-col items-center px-4 md:px-0"
          >
            {/* Progress Bar Container — ARIA progressbar */}
            <div
              role="progressbar"
              aria-label="Loading"
              aria-valuemin={0}
              aria-valuemax={100}
              className="w-full h-2 md:h-3 bg-[#130E24] rounded-full overflow-hidden relative shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] border border-[#2D214F]"
            >
              {/* Progress Bar Fill — scaleX animation, transform-origin: left */}
              <div className="absolute top-0 left-0 w-full h-full bg-primary rounded-full animate-progress-fill shadow-[0_0_12px_rgba(110,84,255,0.9)] flex items-center">
                {/* Shimmer Effect overlay */}
                <div className="absolute top-0 left-0 w-full h-full animate-shimmer-sweep overflow-hidden">
                  <div className="w-[30%] h-full bg-gradient-to-r from-transparent via-[#85E6FF] to-transparent opacity-40 skew-x-[-20deg]" />
                </div>
              </div>
            </div>

            {/* Flavor Text — aria-live so screen readers announce rotations */}
            <div
              className="h-6 mt-6 relative w-full flex justify-center items-center"
              aria-live="polite"
              aria-atomic="true"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={flavorIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="text-muted-foreground text-xs md:text-sm italic absolute text-center w-full"
                >
                  {FLAVOR_TEXTS[flavorIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
