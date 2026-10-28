"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useVenom } from "./VenomProvider";

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const { isVenomMode } = useVenom();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 h-[4px] origin-left z-[100] transition-colors duration-500 ${
        isVenomMode
          ? "bg-white shadow-[0_0_12px_#FFFFFF]"
          : "bg-[#E62229] shadow-[0_0_12px_#E62229]"
      }`}
      style={{ scaleX }}
    />
  );
}

export default ScrollProgressBar;
