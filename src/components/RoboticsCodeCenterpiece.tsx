"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useVenom } from "./VenomProvider";

export function RoboticsCodeCenterpiece() {
  const [isHovered, setIsHovered] = useState(false);
  const { isVenomMode, triggerVenomAttack, revertToSpidey } = useVenom();

  const primaryColor = isVenomMode ? "#FFFFFF" : "#E62229";
  const glowColor = isVenomMode ? "#FFFFFF" : "#00F0FF";

  return (
    <div
      className="relative w-full overflow-hidden select-none py-4 flex flex-col items-center justify-center cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        if (!isVenomMode) {
          triggerVenomAttack();
        } else {
          revertToSpidey();
        }
      }}
      title={
        isVenomMode
          ? "Click to purge the symbiote & return to Spider-Man"
          : "Click to unleash the symbiote"
      }
    >
      {/* Background Vertical Barcode Strip */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 sm:h-40 flex items-center justify-between opacity-85 pointer-events-none z-0">
        <div className="w-full h-full barcode-pattern border-y-2 border-[#F5E8C7]" />
      </div>

      {/* Main Vector Artwork: High-Tech Robotics & Code Mech */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg aspect-[4/3] flex items-center justify-center">
        <svg
          viewBox="0 0 600 450"
          className="w-full h-auto max-h-[340px] drop-shadow-[0_12px_28px_rgba(0,0,0,0.85)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="reactorGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={glowColor} stopOpacity="1" />
              <stop offset="60%" stopColor={glowColor} stopOpacity="0.4" />
              <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="armorMetal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={isVenomMode ? "#0D0D0D" : "#1C2430"} />
              <stop offset="50%" stopColor={isVenomMode ? "#050505" : "#0E141C"} />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>

          {/* Background Ambient Glow */}
          <circle cx="300" cy="220" r="140" fill="url(#reactorGlow)" opacity="0.3" />

          {/* Dual Code Antennas with Nodes */}
          <g>
            {/* Left Antenna */}
            <line x1="220" y1="120" x2="160" y2="40" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
            <circle cx="160" cy="40" r="8" fill={glowColor} stroke={primaryColor} strokeWidth="3" />
            <line x1="160" y1="40" x2="130" y2="40" stroke={glowColor} strokeWidth="2" strokeDasharray="3 3" />
            <text x="120" y="44" fill={glowColor} fontSize="12" fontFamily="monospace" fontWeight="900" textAnchor="end">
              {isVenomMode ? "VENOM:ACTIVE" : "RX:2.4GHz"}
            </text>

            {/* Right Antenna */}
            <line x1="380" y1="120" x2="440" y2="40" stroke={primaryColor} strokeWidth="4" strokeLinecap="round" />
            <circle cx="440" cy="40" r="8" fill={glowColor} stroke={primaryColor} strokeWidth="3" />
            <line x1="440" y1="40" x2="470" y2="40" stroke={glowColor} strokeWidth="2" strokeDasharray="3 3" />
            <text x="480" y="44" fill={glowColor} fontSize="12" fontFamily="monospace" fontWeight="900">
              {isVenomMode ? "SYMBIOTE:312" : "TX:ROOM312"}
            </text>
          </g>

          {/* Mech Shoulder Armor & Hardware Mounts */}
          <path
            d="M 120 380 L 170 250 L 230 250 L 220 380 Z"
            fill="url(#armorMetal)"
            stroke={primaryColor}
            strokeWidth="3"
          />
          <path
            d="M 480 380 L 430 250 L 370 250 L 380 380 Z"
            fill="url(#armorMetal)"
            stroke={primaryColor}
            strokeWidth="3"
          />

          {/* Shoulder Hydraulic Joint Bolts */}
          <circle cx="180" cy="270" r="10" fill="#000" stroke="#F5E8C7" strokeWidth="2" />
          <circle cx="420" cy="270" r="10" fill="#000" stroke="#F5E8C7" strokeWidth="2" />

          {/* Main Robot Torso / Chassis */}
          <path
            d="M 190 240 L 410 240 L 380 400 L 220 400 Z"
            fill="#090E14"
            stroke="#1E2A38"
            strokeWidth="4"
          />

          {/* Core Reactor Chamber (Microcontroller Hub) */}
          <rect x="250" y="270" width="100" height="70" rx="6" fill="#030609" stroke={primaryColor} strokeWidth="3" />
          <circle cx="300" cy="305" r="22" fill="url(#reactorGlow)" />
          <circle cx="300" cy="305" r="12" fill={glowColor} />
          <circle cx="300" cy="305" r="5" fill="#FFFFFF" />

          {/* Torso Circuit Trace Lines */}
          <path d="M 250 305 L 210 305 L 210 350" stroke={glowColor} strokeWidth="2" strokeDasharray="4 2" />
          <path d="M 350 305 L 390 305 L 390 350" stroke={glowColor} strokeWidth="2" strokeDasharray="4 2" />

          {/* Robot Head / Terminal Enclosure */}
          <polygon
            points="210,120 390,120 370,240 230,240"
            fill="url(#armorMetal)"
            stroke={primaryColor}
            strokeWidth="4"
          />

          {/* Stencil Crown Plate with "312" */}
          <polygon points="250,120 350,120 340,145 260,145" fill={primaryColor} />
          <text
            x="300"
            y="138"
            fill="#04080D"
            fontSize="14"
            fontWeight="900"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {isVenomMode ? "VENOM 312" : "LAB 312"}
          </text>

          {/* Holographic Visor */}
          <rect
            x="235"
            y="155"
            width="130"
            height="65"
            rx="4"
            fill="#03080E"
            stroke={glowColor}
            strokeWidth="2.5"
          />

          {/* Eye Glyphs: Normal Code Eyes vs Jagged White Venom Eyes */}
          {isVenomMode ? (
            <g fill="#FFFFFF" filter="drop-shadow(0 0 12px #FFFFFF)">
              {/* Left Venom Eye */}
              <path d="M 245 185 Q 260 165 290 170 Q 285 195 255 200 Z" />
              {/* Right Venom Eye */}
              <path d="M 355 185 Q 340 165 310 170 Q 315 195 345 200 Z" />
            </g>
          ) : (
            <g fill="#00F0FF" stroke="#00F0FF" strokeWidth="1">
              {/* Left < eye */}
              <polyline points="275,175 255,188 275,201" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {/* Middle / divider */}
              <line x1="305" y1="172" x2="295" y2="204" strokeWidth="3" strokeLinecap="round" />
              {/* Right > eye */}
              <polyline points="325,175 345,188 325,201" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          )}

          {/* Micro Code Text on Visor Base */}
          <text
            x="300"
            y="214"
            fill="#F5E8C7"
            fontSize="9"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            letterSpacing="2"
          >
            {isVenomMode ? "SYMBIOTE // C++ // PYTHON" : "C++ // PYTHON // ARDUINO"}
          </text>

          {/* Chest Plate Label */}
          <rect x="260" y="360" width="80" height="18" fill={primaryColor} />
          <text
            x="300"
            y="373"
            fill="#04080D"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="900"
            textAnchor="middle"
          >
            {isVenomMode ? "VENOM PRC" : "CMHS PRC"}
          </text>
        </svg>
      </div>

      {/* Overlapping Stenciled Bold Typography */}
      <div className="relative z-20 -mt-6 sm:-mt-8 w-full flex items-center justify-center">
        <h2
          className={`text-4xl sm:text-6xl md:text-7xl font-mech-wide font-black tracking-widest drop-shadow-[4px_4px_0px_#04080D] transition-colors duration-500 ${
            isVenomMode
              ? "text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.95)]"
              : "text-[#E62229] drop-shadow-[4px_4px_0px_#04080D]"
          }`}
        >
          {isVenomMode ? "WE ARE VENOM" : "CMHS // PRC"}
        </h2>
      </div>

      {/* Bottom Technical HUD Row */}
      <div className="relative z-20 w-full flex items-center justify-between text-[11px] font-mono text-[#F5E8C7] pt-2 px-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-5 h-5 border-2 flex items-center justify-center font-black text-[9px] transition-colors ${
              isVenomMode
                ? "border-white text-white bg-black"
                : "border-[#E62229] text-[#E62229]"
            }`}
          >
            {isVenomMode ? "V" : "312"}
          </span>
          <span className="font-bold tracking-wider">
            {isVenomMode
              ? "Cumilla Modern High School // Symbiote Active"
              : "Cumilla Modern High School Robotics & Code Unit"}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[#F5E8C7]/80">
          <span className="font-mono tracking-widest hidden sm:inline">
            {isVenomMode ? "<<< SYMBIOTE PROTOCOL 312 >>>" : "<<< ALGORITHMS & HARDWARE >>>"}
          </span>
          {/* Circular Target Reticle HUD */}
          <div
            className={`w-6 h-6 rounded-full border flex items-center justify-center relative ${
              isVenomMode ? "border-white" : "border-[#E62229]"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isVenomMode ? "bg-white" : "bg-[#E62229]"
              }`}
            />
            <div className="absolute inset-0 border-t border-b border-[#F5E8C7]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoboticsCodeCenterpiece;
