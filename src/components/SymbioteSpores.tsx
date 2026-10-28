"use client";

import React, { useEffect, useRef } from "react";
import { useVenom } from "./VenomProvider";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  pulse: number;
  pulseSpeed: number;
}

export function SymbioteSpores() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isVenomMode } = useVenom();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Number of particles: more in venom mode (dense Stranger Things spore atmosphere)
    const particleCount = isVenomMode ? 90 : 25;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isVenomMode ? Math.random() * 3.5 + 1 : Math.random() * 2 + 0.8,
        // In venom mode, spores drift upward and swirl like the Upside Down
        speedY: isVenomMode ? -(Math.random() * 0.7 + 0.2) : -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * (isVenomMode ? 0.8 : 0.3),
        opacity: Math.random() * 0.7 + 0.2,
        fadeSpeed: (Math.random() * 0.008 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
        pulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.pulse) * 0.3;
        p.pulse += p.pulseSpeed;
        p.opacity += p.fadeSpeed;

        if (p.opacity > 0.85 || p.opacity < 0.15) {
          p.fadeSpeed = -p.fadeSpeed;
        }

        // Wrap around screen edges
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        if (isVenomMode) {
          // Marvel Venom symbiote: pitch black alien tar motes & stark glowing white bio-ash
          if (i % 3 === 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`; // Stark glowing white
            ctx.shadowColor = "#FFFFFF";
            ctx.shadowBlur = 10;
          } else if (i % 3 === 1) {
            ctx.fillStyle = `rgba(220, 220, 225, ${p.opacity * 0.9})`; // Silver-white razor spore
            ctx.shadowColor = "#E5E5E5";
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = `rgba(20, 20, 20, ${p.opacity * 0.95})`; // Pitch black symbiote blob
            ctx.shadowColor = "#000000";
            ctx.shadowBlur = 8;
          }
        } else {
          // Spider-Man cyber particles: subtle crimson & cyan motes
          if (i % 2 === 0) {
            ctx.fillStyle = `rgba(230, 34, 41, ${p.opacity * 0.5})`;
            ctx.shadowColor = "#E62229";
            ctx.shadowBlur = 4;
          } else {
            ctx.fillStyle = `rgba(0, 240, 255, ${p.opacity * 0.4})`;
            ctx.shadowColor = "#00F0FF";
            ctx.shadowBlur = 4;
          }
        }

        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow for performance
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isVenomMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20 w-full h-full overflow-hidden"
    />
  );
}

export default SymbioteSpores;

