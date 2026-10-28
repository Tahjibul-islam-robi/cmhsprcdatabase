"use client";

import React from "react";
import { useVenom } from "./VenomProvider";

export function SymbioteInfectionVeins() {
  const { isVenomMode } = useVenom();

  if (!isVenomMode) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden select-none">
      {/* Eerie Pure Black Symbiote Vignette */}
      <div
        className="absolute inset-0 transition-opacity duration-1000 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.7) 75%, rgba(0, 0, 0, 0.98) 100%)",
        }}
      />

      {/* Dripping Symbiote Slime Stalactites beneath Sticky Header */}
      <div className="absolute top-14 sm:top-16 inset-x-0 h-6 overflow-hidden opacity-95 drop-shadow-[0_4px_12px_rgba(255,255,255,0.25)]">
        <svg
          viewBox="0 0 1200 40"
          preserveAspectRatio="none"
          className="w-full h-full fill-[#000000] stroke-[#FFFFFF] stroke-[1.5]"
        >
          <path d="M 0 0 L 1200 0 L 1200 8 Q 1150 25 1100 8 Q 1050 35 1020 8 Q 960 22 900 8 Q 850 38 820 8 Q 760 24 700 8 Q 640 40 600 8 Q 540 28 480 8 Q 420 38 390 8 Q 320 22 260 8 Q 200 36 170 8 Q 110 24 50 8 Q 20 30 0 8 Z" />
        </svg>
      </div>

      {/* Top-Left Creeping Alien Tendrils */}
      <div className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 opacity-95 pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-[#000000] stroke-[#FFFFFF] stroke-[2]">
          <path d="M 0 0 L 220 0 Q 180 80 140 110 Q 90 70 80 160 Q 40 180 30 260 Q 10 320 0 350 Z" />
          <path
            d="M 50 20 Q 160 120 180 200 Q 120 240 70 280 Q 20 350 0 380"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 120 0 Q 220 100 280 180 Q 240 250 190 310"
            fill="none"
            stroke="#A3A3A3"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          {/* Barbed Tendril Spikes */}
          <polygon points="140,110 165,130 135,120" fill="#FFFFFF" />
          <polygon points="80,160 105,185 75,170" fill="#FFFFFF" />
          <polygon points="30,260 55,280 25,270" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Top-Right Creeping Alien Tendrils */}
      <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 opacity-95 pointer-events-none">
        <svg viewBox="0 0 400 400" className="w-full h-full fill-[#000000] stroke-[#FFFFFF] stroke-[2]">
          <path d="M 400 0 L 180 0 Q 220 80 260 110 Q 310 70 320 160 Q 360 180 370 260 Q 390 320 400 350 Z" />
          <path
            d="M 350 20 Q 240 120 220 200 Q 280 240 330 280 Q 380 350 400 380"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Barbed Spikes */}
          <polygon points="260,110 235,130 265,120" fill="#FFFFFF" />
          <polygon points="320,160 295,185 325,170" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Bottom-Left Creeping Alien Roots */}
      <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 opacity-95 pointer-events-none">
        <svg viewBox="0 0 350 350" className="w-full h-full fill-[#000000] stroke-[#FFFFFF] stroke-[2]">
          <path d="M 0 350 L 0 160 Q 60 180 100 240 Q 150 210 180 270 Q 220 310 260 350 Z" />
          <path
            d="M 20 300 Q 120 250 160 170 Q 190 120 240 60"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Bottom-Right Creeping Alien Roots */}
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 opacity-95 pointer-events-none">
        <svg viewBox="0 0 350 350" className="w-full h-full fill-[#000000] stroke-[#FFFFFF] stroke-[2]">
          <path d="M 350 350 L 350 160 Q 290 180 250 240 Q 200 210 170 270 Q 130 310 90 350 Z" />
          <path
            d="M 330 300 Q 230 250 190 170 Q 160 120 110 60"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default SymbioteInfectionVeins;

