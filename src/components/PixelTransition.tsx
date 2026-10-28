"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface PixelTransitionProps {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  pixelColor?: string;
  mosaic?: number;
  gridSize?: number;
  pixelShape?: "square" | "circle";
  gap?: number;
  pattern?: "random" | "horizontal" | "vertical";
  pixelAnimation?: "pop" | "fade";
  randomness?: number;
  animationStepDuration?: number;
  fps?: number;
  trigger?: "hover" | "click";
  once?: boolean;
  aspectRatio?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function PixelTransition({
  firstContent,
  secondContent,
  pixelColor = "#E62229",
  gridSize = 10,
  pixelShape = "square",
  gap = 0,
  pattern = "random",
  pixelAnimation = "pop",
  trigger = "hover",
  aspectRatio = "100%",
  style = {},
  className = "",
}: PixelTransitionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [pixels, setPixels] = useState<{ id: number; delay: number }[]>([]);

  useEffect(() => {
    const total = gridSize * gridSize;
    const items = Array.from({ length: total }, (_, i) => ({
      id: i,
      delay: Math.random() * 0.35,
    }));
    setPixels(items);
  }, [gridSize]);

  const handleMouseEnter = () => {
    if (trigger === "hover") setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") setIsHovered(false);
  };

  const handleClick = () => {
    if (trigger === "click") setIsHovered(!isHovered);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`relative overflow-hidden rounded-2xl cursor-pointer select-none ${className}`}
      style={{
        ...style,
        paddingBottom: aspectRatio,
      }}
    >
      {/* First Content */}
      <div className="absolute inset-0 w-full h-full">
        {firstContent}
      </div>

      {/* Second Content (Revealed on hover) */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
          isHovered ? "opacity-100 z-10" : "opacity-0 pointer-events-none"
        }`}
      >
        {secondContent}
      </div>

      {/* Mosaic Pixel Canvas Overlay */}
      <div
        className="absolute inset-0 grid pointer-events-none z-20"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          gap: `${gap}px`,
        }}
      >
        {pixels.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={
              isHovered
                ? {
                    opacity: [0, 0.95, 0],
                    scale: pixelAnimation === "pop" ? [0, 1.2, 0] : [0, 1, 0],
                  }
                : { opacity: 0, scale: 0 }
            }
            transition={{
              duration: 0.45,
              delay: p.delay,
              ease: "easeInOut",
            }}
            className={pixelShape === "circle" ? "rounded-full" : "rounded-none"}
            style={{
              backgroundColor: pixelColor,
            }}
          />
        ))}
      </div>
    </div>
  );
}

