"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface VenomAttackOverlayProps {
  isActive: boolean;
  onComplete: () => void;
}

export function VenomAttackOverlay({ isActive, onComplete }: VenomAttackOverlayProps) {
  const [phase, setPhase] = useState<"dormant" | "strike" | "roaring" | "takeover">("dormant");

  useEffect(() => {
    if (!isActive) {
      setPhase("dormant");
      return;
    }

    setPhase("strike");

    const t1 = setTimeout(() => {
      setPhase("roaring");
    }, 600);

    const t2 = setTimeout(() => {
      setPhase("takeover");
    }, 1800);

    const t3 = setTimeout(() => {
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden select-none">
        {/* Fullscreen Glitch & Screen Shake Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.9, 0.95, 1],
            x: [0, -12, 12, -8, 8, -4, 0],
            y: [0, 8, -8, 6, -6, 2, 0],
          }}
          transition={{ duration: 2.4, ease: "easeInOut" }}
          className="absolute inset-0 bg-[#000000]/98 backdrop-blur-md"
        />

        {/* Symbiote Tendril SVG Layers creeping inwards */}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {/* Top Tendrils Creeping Down */}
          <motion.path
            initial={{ d: "M 0 0 L 1000 0 L 1000 50 Q 500 20 0 50 Z" }}
            animate={{
              d: [
                "M 0 0 L 1000 0 L 1000 80 Q 750 300 500 120 Q 250 350 0 80 Z",
                "M 0 0 L 1000 0 L 1000 450 Q 800 650 500 500 Q 200 650 0 450 Z",
                "M 0 0 L 1000 0 L 1000 1000 L 0 1000 Z",
              ],
            }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            fill="#000000"
            stroke="#FFFFFF"
            strokeWidth="4"
          />

          {/* Bottom Tendrils Creeping Up */}
          <motion.path
            initial={{ d: "M 0 1000 L 1000 1000 L 1000 950 Q 500 980 0 950 Z" }}
            animate={{
              d: [
                "M 0 1000 L 1000 1000 L 1000 920 Q 750 700 500 880 Q 250 650 0 920 Z",
                "M 0 1000 L 1000 1000 L 1000 550 Q 800 350 500 500 Q 200 350 0 550 Z",
                "M 0 1000 L 1000 1000 L 1000 0 L 0 0 Z",
              ],
            }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            fill="#050505"
            stroke="#FFFFFF"
            strokeWidth="4"
          />

          {/* Side Slime Tendril Spikes */}
          <motion.path
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8] }}
            transition={{ duration: 1.2 }}
            d="M 0 200 Q 150 250 50 350 Q 250 450 0 550 Z M 1000 250 Q 850 350 950 450 Q 750 550 1000 650 Z"
            fill="#0A0A0A"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </svg>

        {/* Center Flash: Iconic Jagged White Venom Eyes & Roar */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              scale: phase === "roaring" || phase === "takeover" ? [1, 1.2, 1.05] : 0.8,
              opacity: phase === "strike" ? 0.7 : 1,
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center space-y-4"
          >
            {/* Venom Jagged Eyes Vector */}
            <div className="relative w-72 sm:w-96 h-40 flex items-center justify-between px-6 filter drop-shadow-[0_0_40px_rgba(255,255,255,1)]">
              {/* Left Eye */}
              <motion.svg
                viewBox="0 0 150 100"
                className="w-32 sm:w-44 h-auto"
                initial={{ rotate: -5 }}
                animate={{ rotate: [-5, -8, -5] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
              >
                <path
                  d="M 10 50 Q 40 10 130 5 Q 145 35 120 75 Q 80 95 30 75 Q 5 65 10 50 Z"
                  fill="#FFFFFF"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                {/* Inner eye texture slits */}
                <path d="M 40 45 Q 80 30 110 35" stroke="#000000" strokeWidth="3" fill="none" />
                <path d="M 50 60 Q 80 55 100 65" stroke="#000000" strokeWidth="2" fill="none" />
              </motion.svg>

              {/* Right Eye */}
              <motion.svg
                viewBox="0 0 150 100"
                className="w-32 sm:w-44 h-auto"
                initial={{ rotate: 5 }}
                animate={{ rotate: [5, 8, 5] }}
                transition={{ repeat: Infinity, duration: 0.4 }}
              >
                <path
                  d="M 140 50 Q 110 10 20 5 Q 5 35 30 75 Q 70 95 120 75 Q 145 65 140 50 Z"
                  fill="#FFFFFF"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path d="M 110 45 Q 70 30 40 35" stroke="#000000" strokeWidth="3" fill="none" />
                <path d="M 100 60 Q 70 55 50 65" stroke="#000000" strokeWidth="2" fill="none" />
              </motion.svg>
            </div>

            {/* Jagged Razor Teeth Jaw Graphic */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: phase === "roaring" ? 1 : 0.8 }}
              className="w-80 sm:w-[420px] h-20 flex items-center justify-center overflow-hidden"
            >
              <svg viewBox="0 0 400 80" className="w-full h-full fill-white stroke-black stroke-2">
                {/* Top Razor Teeth */}
                <polygon points="20,0 35,35 50,0 65,40 80,0 95,35 110,0 125,45 140,0 155,40 170,0 185,45 200,0 215,45 230,0 245,40 260,0 275,45 290,0 305,35 320,0 335,40 350,0 365,35 380,0" />
                {/* Bottom Razor Teeth */}
                <polygon points="30,80 45,45 60,80 75,40 90,80 105,45 120,80 135,35 150,80 165,40 180,80 195,35 210,80 225,35 240,80 255,40 270,80 285,35 300,80 315,45 330,80 345,40 360,80 375,45" />
              </svg>
            </motion.div>

            {/* Kinetic Text Banner: WE ARE VENOM */}
            <motion.div
              initial={{ letterSpacing: "2px", opacity: 0 }}
              animate={{ letterSpacing: "12px", opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center font-mono"
            >
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-widest uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]">
                WE ARE VENOM
              </h2>
              <span className="text-xs sm:text-sm text-white font-black tracking-widest block mt-2 opacity-90">
                /// SYMBIOTE ASSIMILATION COMPLETE /// ROOM 312
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default VenomAttackOverlay;

