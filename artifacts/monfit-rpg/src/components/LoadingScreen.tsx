import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FLAVOR_TEXTS = [
  "Затачиваем меч...",
  "Считаем шаги...",
  "Загружаем подземелье...",
  "Готовим зелья восстановления...",
  "Призываем тренера...",
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
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 overflow-hidden relative">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[400px]">
        {/* Logo and Title Group */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center w-full"
        >
          {/* Custom SVG Emblem (Sword + Dumbbell) */}
          <div className="relative w-[120px] h-[120px] md:w-[180px] md:h-[180px] mb-6 flex items-center justify-center">
            {/* Ambient glow behind logo */}
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />

            <svg
              viewBox="0 0 100 100"
              className="w-full h-full relative z-10 drop-shadow-[0_0_15px_rgba(110,84,255,0.6)]"
            >
              {/* Dumbbell background shadow block for depth */}
              <rect
                x="25"
                y="43"
                width="50"
                height="14"
                fill="#0E091C"
                rx="3"
              />
              <rect
                x="13"
                y="28"
                width="14"
                height="44"
                fill="#0E091C"
                rx="4"
              />
              <rect
                x="73"
                y="28"
                width="14"
                height="44"
                fill="#0E091C"
                rx="4"
              />

              {/* Dumbbell Handle */}
              <rect
                x="27"
                y="45"
                width="46"
                height="10"
                fill="#2D214F"
                rx="2"
              />

              {/* Dumbbell Left Weights */}
              <rect
                x="15"
                y="30"
                width="10"
                height="40"
                fill="#6E54FF"
                rx="3"
              />
              <rect x="5" y="35" width="8" height="30" fill="#4B39B5" rx="2" />
              {/* Left Weight Highlight */}
              <rect
                x="16"
                y="32"
                width="2"
                height="36"
                fill="#85E6FF"
                opacity="0.4"
                rx="1"
              />

              {/* Dumbbell Right Weights */}
              <rect
                x="75"
                y="30"
                width="10"
                height="40"
                fill="#6E54FF"
                rx="3"
              />
              <rect x="87" y="35" width="8" height="30" fill="#4B39B5" rx="2" />
              {/* Right Weight Highlight */}
              <rect
                x="76"
                y="32"
                width="2"
                height="36"
                fill="#85E6FF"
                opacity="0.4"
                rx="1"
              />

              {/* Sword Diagonal */}
              <g transform="rotate(45 50 50)">
                {/* Blade shadow drop */}
                <path
                  d="M46 10 L50 2 L54 10 L54 60 L46 60 Z"
                  fill="#0E091C"
                  opacity="0.5"
                />
                {/* Main Blade */}
                <path d="M46 10 L50 2 L54 10 L54 60 L46 60 Z" fill="#E2E8F0" />
                {/* Blade dark edge for 3D effect */}
                <path d="M50 2 L54 10 L54 60 L50 60 Z" fill="#94A3B8" />
                {/* Inner blade cyan groove */}
                <path
                  d="M49 12 L51 12 L51 55 L49 55 Z"
                  fill="#85E6FF"
                  opacity="0.8"
                />

                {/* Crossguard */}
                <rect
                  x="33"
                  y="60"
                  width="34"
                  height="6"
                  fill="#6E54FF"
                  rx="1"
                />
                {/* Crossguard highlight */}
                <rect
                  x="34"
                  y="61"
                  width="32"
                  height="2"
                  fill="#85E6FF"
                  opacity="0.5"
                  rx="0.5"
                />

                {/* Grip */}
                <rect x="46" y="66" width="8" height="20" fill="#1C1438" />

                {/* Pommel */}
                <circle cx="50" cy="88" r="6" fill="#6E54FF" />
                {/* Pommel highlight */}
                <circle cx="50" cy="88" r="3" fill="#85E6FF" opacity="0.6" />
              </g>
            </svg>
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
          {/* Progress Bar Container */}
          <div className="w-full h-2 md:h-3 bg-[#130E24] rounded-full overflow-hidden relative shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)] border border-[#2D214F]">
            {/* Progress Bar Fill */}
            <div className="absolute top-0 left-0 h-full bg-primary rounded-full animate-progress-fill shadow-[0_0_12px_rgba(110,84,255,0.9)] flex items-center">
              {/* Shimmer Effect overlay */}
              <div className="absolute top-0 left-0 w-full h-full animate-shimmer-sweep overflow-hidden">
                <div className="w-[30%] h-full bg-gradient-to-r from-transparent via-[#85E6FF] to-transparent opacity-40 skew-x-[-20deg]" />
              </div>
            </div>
          </div>

          {/* Flavor Text */}
          <div className="h-6 mt-6 relative w-full flex justify-center items-center">
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
  );
}
