"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Shield, Sparkles, Terminal, Cpu, Skull, Biohazard } from "lucide-react";
import { useVenom } from "./VenomProvider";

export interface CyberMemberBadgeProps {
  id?: string;
  name: string;
  role: string;
  affiliation?: string;
  level?: string | number;
}

export function CyberMemberBadge({
  id = "PRC-01",
  name,
  role,
  affiliation = "Room 312",
  level = "01",
}: CyberMemberBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { isVenomMode } = useVenom();

  // Extract initials from name (e.g. Tahjibul Islam Robi -> TR)
  const initials = name
    ? name
        .split(" ")
        .filter((w) => w.length > 0)
        .map((w) => w[0].toUpperCase())
        .filter((_, idx, arr) => idx === 0 || idx === arr.length - 1)
        .join("")
    : "PRC";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`border-2 overflow-hidden group transition-all font-mono select-none ${
        isVenomMode
          ? "border-white bg-[#000000] shadow-[6px_6px_0px_#FFFFFF] hover:shadow-[10px_10px_0px_#FFFFFF]"
          : "border-[#E62229] bg-[#081726] shadow-[6px_6px_0px_#E62229] hover:shadow-[10px_10px_0px_#000000]"
      }`}
    >
      {/* Top Cyber Clearance Header */}
      <div
        className={`px-3 py-1.5 flex items-center justify-between text-[11px] font-black border-b-2 transition-colors duration-500 ${
          isVenomMode
            ? "bg-white text-black border-white"
            : "bg-[#E62229] text-black border-black"
        }`}
      >
        <span className="flex items-center gap-1.5">
          {isVenomMode ? (
            <Skull className="w-3.5 h-3.5 text-black" />
          ) : (
            <Shield className="w-3.5 h-3.5 fill-black stroke-none" />
          )}
          <span>
            {isVenomMode
              ? `SYMBIOTE HOST // ENTITY ${level}`
              : `CLEARANCE // LEVEL ${level}`}
          </span>
        </span>
        <span>ID: {id}</span>
      </div>

      {/* Cyber Digital ID Badge (No fake photo) */}
      <div
        className={`relative aspect-[4/3] w-full p-4 flex flex-col items-center justify-center overflow-hidden border-b-2 transition-colors duration-500 ${
          isVenomMode
            ? "bg-[#050505] border-white/40"
            : "bg-[#04080D] border-[#E62229]"
        }`}
      >
        {/* Animated Scanning Laser Line on Hover */}
        <div
          className={`absolute inset-x-0 h-0.5 pointer-events-none transition-all duration-1000 ${
            isVenomMode
              ? "bg-gradient-to-r from-transparent via-white to-transparent"
              : "bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent"
          } ${isHovered ? "top-[90%] opacity-100" : "top-[10%] opacity-30"}`}
        />

        {/* Ambient Grid Lines Background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: isVenomMode
              ? "linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)"
              : "linear-gradient(to right, #E62229 1px, transparent 1px), linear-gradient(to bottom, #E62229 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Background Robot Watermark */}
        <div className="absolute right-3 bottom-2 opacity-10 w-24 h-24 pointer-events-none">
          <Image
            src="/assets/brand/cmhs-prc-profile.svg"
            alt="Watermark"
            width={96}
            height={96}
            className={`object-contain ${
              isVenomMode ? "filter drop-shadow-[0_0_8px_#FFFFFF] brightness-125" : ""
            }`}
          />
        </div>

        {/* Central Initials Monogram Block */}
        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div
            className={`w-20 h-20 border-2 p-2 flex items-center justify-center transition-all ${
              isVenomMode
                ? "border-white bg-[#0E0E0E] shadow-[4px_4px_0px_#FFFFFF] group-hover:border-neutral-200 group-hover:shadow-[4px_4px_0px_#FFFFFF]"
                : "border-[#E62229] bg-[#081726] shadow-[4px_4px_0px_#E62229] group-hover:border-[#00F0FF] group-hover:shadow-[4px_4px_0px_#00F0FF]"
            }`}
          >
            <span
              className={`text-3xl font-mech-wide font-black tracking-wider transition-colors ${
                isVenomMode
                  ? "text-white group-hover:text-white"
                  : "text-[#F5E8C7] group-hover:text-[#00F0FF]"
              }`}
            >
              {initials}
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[9px] font-bold tracking-widest uppercase transition-colors ${
              isVenomMode
                ? "bg-[#111111] border-white/60 text-white"
                : "bg-[#081726] border-[#E62229]/60 text-[#00F0FF]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isVenomMode ? "bg-white" : "bg-[#00F0FF]"
              }`}
            />
            <span>
              {isVenomMode ? "SYMBIOTE BONDED" : "AUTHENTICATED MEMBER"}
            </span>
          </div>
        </div>

        {/* Barcode bottom strip in badge */}
        <div className="absolute bottom-1 inset-x-4 h-2 barcode-pattern opacity-40" />
      </div>

      {/* Member Details Footer with Animated Text */}
      <div
        className={`p-4 space-y-1.5 transition-colors duration-500 ${
          isVenomMode ? "bg-[#000000]" : "bg-[#04080D]"
        }`}
      >
        <div className="flex items-center justify-between">
          <h3
            className={`font-black text-base truncate tracking-wide transition-colors ${
              isVenomMode
                ? "text-white group-hover:text-neutral-200"
                : "text-white group-hover:text-[#E62229]"
            }`}
          >
            {name}
          </h3>
          <span
            className={`text-[10px] font-bold border px-1.5 py-0.5 shrink-0 ${
              isVenomMode
                ? "text-white border-white/40 bg-[#111111]"
                : "text-[#00F0FF] border-[#00F0FF]/40 bg-[#081726]"
            }`}
          >
            {isVenomMode ? "ROOM 312 // HIVE" : affiliation}
          </span>
        </div>

        {/* Role */}
        <p
          className={`text-xs font-black tracking-wider uppercase truncate ${
            isVenomMode ? "text-white opacity-90" : "text-[#E62229]"
          }`}
        >
          {role}
        </p>

        {/* Status Line */}
        <div
          className={`pt-2 border-t flex items-center justify-between text-[10px] ${
            isVenomMode
              ? "border-white/20 text-[#aaaaaa]"
              : "border-[#E62229]/30 text-[#888888]"
          }`}
        >
          <span>{isVenomMode ? "HIVE ARCHITECTURE" : "CMHS EXECUTIVE COMMITTEE"}</span>
          <span
            className={`font-bold ${
              isVenomMode ? "text-white" : "text-[#00FF66]"
            }`}
          >
            ● {isVenomMode ? "INFECTED" : "ACTIVE"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default CyberMemberBadge;

