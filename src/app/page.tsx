"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Cpu,
  Code2,
  Calendar,
  Clock,
  MapPin,
  Shield,
  ChevronDown,
  Terminal,
  Activity,
  QrCode,
  Layers,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import PixelTransition from "@/components/PixelTransition";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/ScrollReveal";
import { RoboticsCodeCenterpiece } from "@/components/RoboticsCodeCenterpiece";
import { CyberMemberBadge } from "@/components/CyberMemberBadge";
import { useVenom } from "@/components/VenomProvider";
import type { ClubEvent, BlogPost, TeamMember, SitePage } from "@/lib/types";

const ROLE_PRIORITY = [
  "President",
  "Vice President",
  "General Secretary",
  "Joint Secretary",
  "Treasurer",
  "Organizing Secretary",
  "IT Secretary",
  "Publicity Secretary",
  "Volunteer Coordinator",
  "Event Volunteer",
  "Technical Volunteer",
  "Content Volunteer",
  "Executive Member",
  "Delegate",
  "Trainer",
  "Assistant Trainer",
];

const CLUB_FAQS = [
  {
    q: "01 // WHO IS ELIGIBLE FOR CMHS PRC ADMISSION?",
    a: "Membership is strictly open to enrolled students of Cumilla Modern High School from Class 6 through Class 10. Per club constitution, Class 10 candidates cannot register after school pre-test examinations so they can dedicate full focus to board preparations.",
  },
  {
    q: "02 // WHERE IS THE PHYSICAL ROBOTICS LAB HEADQUARTERS?",
    a: "All physical hardware development, microcontroller soldering labs, telemetry sensor stations, and competitive code sessions occur in Room 312 during official club hours.",
  },
  {
    q: "03 // ARE WORKSHOPS AND BATCH MATERIALS FREE?",
    a: "Yes, 100% free. All curated lecture repositories, physical component toolkits, and digital batch portal credentials are provided to verified club members without tuition fees.",
  },
  {
    q: "04 // HOW DOES A CANDIDATE ACQUIRE A VERIFIED CLUB CODE?",
    a: "Students collect physical application slips from Room 312. Following executive committee and guardian verification, unique alphanumeric club IDs are assigned for digital batch access.",
  },
];

export default function HomePage() {
  const [siteData, setSiteData] = useState<SitePage | null>(null);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { isVenomMode } = useVenom();

  useEffect(() => {
    async function fetchData() {
      try {
        const [pagesRes, eventsRes, blogRes, teamRes] = await Promise.all([
          supabase.rpc("get_public_site_pages"),
          supabase.rpc("get_public_site_events", { p_limit: 3 }),
          supabase.rpc("get_public_site_blog", { p_limit: 3, p_offset: 0 }),
          supabase.rpc("get_public_club_team"),
        ]);

        if (pagesRes.data) {
          const home = pagesRes.data.find((p: SitePage) => p.slug === "home");
          if (home) setSiteData(home);
        }
        if (eventsRes.data) setEvents(eventsRes.data);
        if (blogRes.data) setPosts(blogRes.data);
        if (teamRes.data) {
          const sorted = [...teamRes.data].sort((a, b) => {
            const rankA = ROLE_PRIORITY.indexOf(String(a.position_title || a.team_role));
            const rankB = ROLE_PRIORITY.indexOf(String(b.position_title || b.team_role));
            return (rankA === -1 ? 99 : rankA) - (rankB === -1 ? 99 : rankB);
          });
          setTeam(sorted.slice(0, 6));
        }
      } catch (err) {
        console.warn("Supabase fetch notice:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24 font-mono select-none">
      {/* =========================================================================
          THE CYBER-DECK HERO POSTER (Exact Composition of Reference Image)
          ========================================================================= */}
      <section
        className={`relative w-full border-4 transition-all duration-500 overflow-hidden ${
          isVenomMode
            ? "border-white bg-[#000000] shadow-[12px_12px_0px_#FFFFFF]"
            : "border-[#E62229] bg-[#04080D] shadow-[12px_12px_0px_#E62229]"
        }`}
      >
        <div
          className={`grid grid-cols-1 lg:grid-cols-12 items-stretch divide-y-4 lg:divide-y-0 lg:divide-x-4 transition-colors duration-500 ${
            isVenomMode ? "divide-white" : "divide-[#E62229]"
          }`}
        >
          {/* -------------------------------------------------------------
              LEFT COLUMN: TECHNICAL SIDEBAR
              ------------------------------------------------------------- */}
          <div
            className={`lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-8 relative overflow-hidden transition-colors duration-500 ${
              isVenomMode
                ? "bg-[#000000] text-white"
                : "bg-[#E62229] text-black"
            }`}
          >
            {/* Top: Stencil Year / Venom Mode Indicator */}
            <div className="space-y-2">
              <div
                className={`flex items-center justify-between border-b-2 pb-2 text-xs font-black ${
                  isVenomMode ? "border-white/40 text-white" : "border-black"
                }`}
              >
                <span className="tracking-widest">
                  {isVenomMode ? "SYMBIOTE ASSIMILATION" : "CUMILLA MODERN HIGH"}
                </span>
                <span>ROOM 312</span>
              </div>
              <h2
                className={`text-6xl sm:text-7xl font-black tracking-tighter leading-none ${
                  isVenomMode
                    ? "text-white drop-shadow-[0_0_16px_rgba(255,255,255,0.9)]"
                    : ""
                }`}
              >
                {isVenomMode ? "VENOM" : "2026"}
              </h2>
            </div>

            {/* Middle: Robot Mascot Illustration & Club Specifications */}
            <div className="space-y-6 relative z-10">
              <div
                className={`flex items-center justify-between text-[11px] font-black border-t-2 border-b-2 py-1 ${
                  isVenomMode
                    ? "border-white/40 text-white"
                    : "border-black"
                }`}
              >
                <span>ROBOTICS LAB // ROOM 312</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 ${
                    isVenomMode
                      ? "bg-[#111111] text-white border border-white/40"
                      : "bg-black text-[#F5E8C7]"
                  }`}
                >
                  EST. 2024
                </span>
              </div>

              {/* Official Robot Mascot Card */}
              <div
                className={`border-4 p-5 space-y-4 group transition-colors ${
                  isVenomMode
                    ? "border-white bg-[#000000] shadow-[6px_6px_0px_#FFFFFF]"
                    : "border-black bg-[#04080D] shadow-[6px_6px_0px_#000000]"
                }`}
              >
                <div
                  className={`relative aspect-square w-full bg-black border-2 p-3 flex items-center justify-center overflow-hidden ${
                    isVenomMode ? "border-white" : "border-[#E62229]"
                  }`}
                >
                  <Image
                    src="/assets/brand/cmhs-prc-profile.svg"
                    alt="CMHS PRC Robot Mascot"
                    width={180}
                    height={180}
                    className={`object-contain transition-transform duration-500 group-hover:scale-110 ${
                      isVenomMode
                        ? "filter drop-shadow-[0_0_20px_rgba(255,255,255,0.9)] brightness-125"
                        : "filter drop-shadow-[0_0_16px_rgba(230,34,41,0.8)]"
                    }`}
                    priority
                  />
                  <div
                    className={`absolute bottom-2 left-2 text-[9px] font-black px-1.5 py-0.5 border ${
                      isVenomMode
                        ? "text-white bg-black border-white"
                        : "text-[#E62229] bg-black border-[#E62229]"
                    }`}
                  >
                    {isVenomMode ? "HOST: SYMBIOTE-01" : "MODEL: PRC-ROV"}
                  </div>
                </div>

                <div className="text-[#F5E8C7] text-xs space-y-1">
                  <span
                    className={`font-black tracking-widest block ${
                      isVenomMode ? "text-white" : "text-[#E62229]"
                    }`}
                  >
                    {isVenomMode
                      ? "MUTATED RECON HOST // 312"
                      : "AUTONOMOUS SYSTEMS // UNIT 01"}
                  </span>
                  <p className="text-[11px] text-[#aaaaaa] leading-tight">
                    {isVenomMode
                      ? "Pure Marvel symbiote tar has bonded with sonar telemetry and motor chassis."
                      : "Sonar Obstacle Avoidance Rover & Microcontroller Unit."}
                  </p>
                </div>
              </div>

              {/* Technical Telemetry micro-text */}
              <div
                className={`text-[10px] font-mono leading-tight space-y-0.5 opacity-90 border-l-2 pl-2 ${
                  isVenomMode
                    ? "border-white text-white"
                    : "border-black text-black"
                }`}
              >
                <div>&gt; CORE_SYS: {isVenomMode ? "SYMBIOTIC" : "STABLE"}</div>
                <div>&gt; BAUD_RATE: 115200</div>
                <div>&gt; LAB_NODE: CMHS_312</div>
                <div>&gt; ACCESS: {isVenomMode ? "HIVE_MIND" : "CLASSES_6_TO_10"}</div>
              </div>
            </div>

            {/* Bottom: Hardware Rover Schematic Module */}
            <div
              className={`pt-4 border-t-2 space-y-3 ${
                isVenomMode ? "border-white/40" : "border-black"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-black">
                <span>{isVenomMode ? "® SYMBIOTE LAB // 312" : "® PRC HARDWARE LAB"}</span>
                <span>ROOM 312</span>
              </div>

              {/* Rover Schematic SVG */}
              <div
                className={`w-full border-2 p-2 flex items-center justify-between ${
                  isVenomMode
                    ? "bg-[#000000] border-white text-white"
                    : "bg-[#04080D] border-black text-[#F5E8C7]"
                }`}
              >
                <svg
                  viewBox="0 0 200 60"
                  className={`w-full h-10 ${
                    isVenomMode ? "text-white" : "text-[#E62229]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                >
                  {/* Rover Wheels */}
                  <circle cx="35" cy="45" r="12" strokeWidth="3" fill="#111" />
                  <circle
                    cx="35"
                    cy="45"
                    r="5"
                    strokeWidth="2"
                    fill={isVenomMode ? "#FFFFFF" : "#E62229"}
                  />
                  <circle cx="165" cy="45" r="12" strokeWidth="3" fill="#111" />
                  <circle
                    cx="165"
                    cy="45"
                    r="5"
                    strokeWidth="2"
                    fill={isVenomMode ? "#FFFFFF" : "#E62229"}
                  />
                  {/* Chassis */}
                  <path
                    d="M 20 40 L 40 40 L 55 25 L 145 25 L 160 40 L 180 40"
                    strokeWidth="3"
                  />
                  {/* Sensor mast & ultrasonic turret */}
                  <line x1="80" y1="25" x2="80" y2="10" strokeWidth="2" />
                  <rect
                    x="70"
                    y="8"
                    width="20"
                    height="8"
                    rx="2"
                    strokeWidth="2"
                    fill="#222"
                  />
                  <circle
                    cx="75"
                    cy="12"
                    r="2"
                    fill={isVenomMode ? "#FFFFFF" : "#00F0FF"}
                  />
                  <circle
                    cx="85"
                    cy="12"
                    r="2"
                    fill={isVenomMode ? "#FFFFFF" : "#00F0FF"}
                  />
                  {/* Battery & PCB block */}
                  <rect
                    x="100"
                    y="16"
                    width="35"
                    height="10"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                </svg>
              </div>

              <div
                className={`flex items-center justify-between text-[10px] font-black tracking-widest ${
                  isVenomMode ? "text-white" : "text-black"
                }`}
              >
                <span>[Z] UNIT: {isVenomMode ? "VENOM-01" : "ROV-01"}</span>
                <span>{isVenomMode ? "BONDED: 100%" : "TELEMETRY: OK"}</span>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------
              RIGHT STAGE: DEEP CYBER DECK
              ------------------------------------------------------------- */}
          <div
            className={`lg:col-span-8 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-10 relative overflow-hidden transition-colors duration-500 ${
              isVenomMode
                ? "bg-[#050505] text-white"
                : "bg-[#081726] text-[#F5E8C7]"
            }`}
          >
            {/* Top: Giant Ultra-Wide Mech Headline */}
            <div className="space-y-4 relative z-10">
              <div
                className={`flex items-center justify-between text-xs font-black tracking-widest border-b pb-2 ${
                  isVenomMode
                    ? "text-white border-white/40"
                    : "text-[#E62229] border-[#E62229]/40"
                }`}
              >
                <span>
                  {isVenomMode
                    ? "/// HIVE_DIRECTIVE // SYMBIOTE_INTEGRATION"
                    : "/// SPECIFICATION // AUTONOMOUS_SYSTEMS"}
                </span>
                <span>ROOM 312</span>
              </div>

              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-mech-wide font-black tracking-wider leading-none ${
                  isVenomMode
                    ? "text-white drop-shadow-[0_0_24px_rgba(255,255,255,0.9)]"
                    : "text-[#F5E8C7]"
                }`}
              >
                {isVenomMode ? "SYMBIOTE PROTOCOL" : "ROBOTICS & CODE"}
              </h1>

              {/* Hazard Diagonal Warning Stripes */}
              <div
                className={`h-8 w-full border-t-2 border-b-2 ${
                  isVenomMode
                    ? "hazard-stripes border-white"
                    : "hazard-stripes border-[#F5E8C7]"
                }`}
              />
            </div>

            {/* Central Stage Visual: High-Tech Robotics & Code Centerpiece */}
            <div className="relative z-10 py-2 space-y-6">
              {/* Robotics & Code Mech Centerpiece with Holographic Visor & Antennas */}
              <RoboticsCodeCenterpiece />

              {/* Lab Mission & Terminal Briefing */}
              <div
                className={`border-2 p-5 space-y-3 transition-colors ${
                  isVenomMode
                    ? "border-white bg-[#0A0A0A] shadow-[5px_5px_0px_#FFFFFF]"
                    : "border-[#E62229] bg-[#04080D] shadow-[5px_5px_0px_#E62229]"
                }`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-black">
                  <div
                    className={`inline-flex items-center gap-2 ${
                      isVenomMode ? "text-white" : "text-[#E62229]"
                    }`}
                  >
                    <Activity className="w-4 h-4 stroke-[3]" />
                    <span>
                      {isVenomMode
                        ? "SYMBIOTE MISSION DIRECTIVE // ROOM 312"
                        : "LABORATORY MISSION // ROOM 312"}
                    </span>
                  </div>
                  <span className="text-[#F5E8C7]/80 text-[11px] font-mono">
                    STATUS: {isVenomMode ? "SYMBIOTE DOMINANT" : "OPERATIONAL"}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed">
                  {isVenomMode
                    ? "We are the Cumilla Modern High School Programming & Robotics Club. The symbiote amplifies our algorithms, accelerates our telemetry builds, and unites our batch into an unstoppable hive mind."
                    : siteData?.hero_intro ||
                      "A student-led engineering collective in Cumilla Modern High School. We specialize in competitive algorithms (C++/Python), physical telemetry rovers, and building tools for student developers."}
                </p>
              </div>
            </div>

            {/* Bottom Cyber-Deck Navigation Action Buttons */}
            <div
              className={`relative z-10 pt-4 border-t-2 flex flex-wrap items-center gap-4 ${
                isVenomMode ? "border-white/40" : "border-[#E62229]"
              }`}
            >
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/batch-portal"
                  className={`text-xs sm:text-sm ${
                    isVenomMode
                      ? "px-6 py-3 bg-white text-black font-black tracking-wider shadow-[4px_4px_0px_#333333] hover:bg-neutral-200 flex items-center gap-2"
                      : "btn-cyber-primary"
                  }`}
                >
                  <span>{isVenomMode ? "ENTER SYMBIOTE HIVE" : "ENTER BATCH PORTAL"}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/join"
                  className={`text-xs sm:text-sm ${
                    isVenomMode
                      ? "px-6 py-3 border-2 border-white bg-[#111111] text-white hover:bg-white hover:text-black font-black tracking-wider shadow-[4px_4px_0px_#FFFFFF] flex items-center gap-2"
                      : "btn-cyber-navy"
                  }`}
                >
                  <span>{isVenomMode ? "ASSIMILATION (ROOM 312)" : "HOW TO JOIN (ROOM 312)"}</span>
                  <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/events"
                  className={`px-6 py-3 border-2 text-xs font-black tracking-wider transition-colors ${
                    isVenomMode
                      ? "border-white text-white hover:bg-white hover:text-black"
                      : "border-white/30 text-white hover:border-[#E62229] hover:text-[#E62229]"
                  }`}
                >
                  <span>{isVenomMode ? "CORRUPTED TIMETABLE" : "EXPLORE EVENTS"}</span>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 01: [PROJECT // 01: HARDWARE & SOFTWARE ACADEMY]
          ========================================================================= */}
      <ScrollReveal className="space-y-8">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 pb-4 transition-colors duration-500 ${
            isVenomMode ? "border-white" : "border-[#E62229]"
          }`}
        >
          <div>
            <span
              className={`text-xs font-black tracking-widest ${
                isVenomMode ? "text-white" : "text-[#E62229]"
              }`}
            >
              {isVenomMode
                ? "[SYMBIOTE // 01 // HIVE DISCIPLINES]"
                : "[PROJECT // 01 // CORE DISCIPLINES]"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
              {isVenomMode
                ? "The Living Symbiote Collective"
                : siteData?.section_title || "A Club for Curious Minds"}
            </h2>
          </div>
          <Link
            href="/about"
            className={`text-xs font-black flex items-center gap-1 transition-colors ${
              isVenomMode
                ? "text-white hover:underline"
                : "text-[#F5E8C7] hover:text-[#E62229]"
            }`}
          >
            <span>{isVenomMode ? "HIVE ORIGINS" : "DISCOVER STORY"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

        {/* 2-Column Cyberpunk Card Grid with PixelTransition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3 Mech Disciplines */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-sm sm:text-base text-[#cccccc] leading-relaxed">
              {isVenomMode
                ? "Our minds are linked. In Room 312, student engineering merges with alien symbiote speed to forge elite competitive algorithmic intuition and autonomous robotics."
                : "We learn programming, explore robotics, and share what we discover with one another. Founded by passionate students in Cumilla Modern High School, PRC combines competitive algorithms with physical embedded telemetry."}
            </p>

            <div className="space-y-4">
              <div
                className={`border-2 p-5 space-y-2 transition-all ${
                  isVenomMode
                    ? "border-white bg-[#0A0A0A] shadow-[5px_5px_0px_#FFFFFF]"
                    : "border-[#E62229] bg-[#081726] shadow-[5px_5px_0px_#E62229]"
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs font-black ${
                    isVenomMode ? "text-white" : "text-[#E62229]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 stroke-[2.5]" />
                    {isVenomMode
                      ? "01. SYMBIOTIC ALGORITHMIC HIVE"
                      : "01. COMPETITIVE PROGRAMMING ACADEMY"}
                  </span>
                  <span>PYTHON // C++</span>
                </div>
                <p className="text-xs text-[#aaaaaa] leading-relaxed">
                  Algorithmic complexity, tree traversals, dynamic programming, and structured olympiad training for division contests.
                </p>
              </div>

              <div
                className={`border-2 p-5 space-y-2 transition-all ${
                  isVenomMode
                    ? "border-white bg-[#0A0A0A] shadow-[5px_5px_0px_#FFFFFF]"
                    : "border-[#E62229] bg-[#081726] shadow-[5px_5px_0px_#E62229]"
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs font-black ${
                    isVenomMode ? "text-white" : "text-[#E62229]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 stroke-[2.5]" />
                    {isVenomMode
                      ? "02. BIOMECHANICAL TELEMETRY MUTATION"
                      : "02. ROBOTICS & EMBEDDED TELEMETRY LAB"}
                  </span>
                  <span>ARDUINO // ROOM 312</span>
                </div>
                <p className="text-xs text-[#aaaaaa] leading-relaxed">
                  Microcontroller soldering, ultrasonic obstacle-avoiding rovers, and ambient laboratory sensor stations in Room 312.
                </p>
              </div>

              <div
                className={`border-2 p-5 space-y-2 transition-all ${
                  isVenomMode
                    ? "border-white bg-[#0A0A0A] shadow-[5px_5px_0px_#FFFFFF]"
                    : "border-[#E62229] bg-[#081726] shadow-[5px_5px_0px_#E62229]"
                }`}
              >
                <div
                  className={`flex items-center justify-between text-xs font-black ${
                    isVenomMode ? "text-white" : "text-[#E62229]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 stroke-[2.5]" />
                    {isVenomMode
                      ? "03. INFECTED ARCHIVES & NEURAL ROSTER"
                      : "03. STUDENT BATCH PORTAL & REPOSITORY"}
                  </span>
                  <span>CLASSES 6–10 // ARCHIVES</span>
                </div>
                <p className="text-xs text-[#aaaaaa] leading-relaxed">
                  Direct digital access to curated lecture materials, weekly problem sets, and student batch rosters for active cohorts.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: React Bits PixelTransition Dual-State */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] space-y-3">
              <div
                className={`border-4 p-2 transition-all ${
                  isVenomMode
                    ? "border-white bg-[#000000] shadow-[8px_8px_0px_#FFFFFF]"
                    : "border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#E62229]"
                }`}
              >
                <PixelTransition
                  firstContent={
                    <div
                      className={`relative w-full aspect-square flex flex-col justify-between p-6 border-2 ${
                        isVenomMode
                          ? "bg-[#050505] border-white/40"
                          : "bg-[#081726] border-[#E62229]/40"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between text-xs font-black ${
                          isVenomMode ? "text-white" : "text-[#E62229]"
                        }`}
                      >
                        <span>{isVenomMode ? "[SYMBIOTE_LAB]" : "[HARDWARE_LAB]"}</span>
                        <Cpu className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-[#F5E8C7] font-mono">
                          SPEC: ROOM 312 // TELEMETRY
                        </span>
                        <h4 className="text-lg font-black text-white uppercase">
                          {isVenomMode ? "Symbiote Rover" : "Autonomous Rover"}
                        </h4>
                        <p className="text-xs text-[#aaaaaa]">
                          Dual H-Bridge Motor Telemetry & Sonar
                        </p>
                      </div>
                      <div
                        className={`text-[10px] font-black border-t pt-2 tracking-widest ${
                          isVenomMode
                            ? "text-white border-white/30"
                            : "text-[#E62229] border-[#E62229]/30"
                        }`}
                      >
                        [HOVER TO TRIGGER PIXEL SHIFT]
                      </div>
                    </div>
                  }
                  secondContent={
                    <div
                      className={`relative w-full aspect-square flex flex-col justify-between p-6 border-2 ${
                        isVenomMode
                          ? "bg-[#111111] border-white"
                          : "bg-[#0c1c2e] border-[#F5E8C7]"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-between text-xs font-black ${
                          isVenomMode ? "text-white" : "text-[#F5E8C7]"
                        }`}
                      >
                        <span>{isVenomMode ? "[HIVE_CORE]" : "[CODE_ACADEMY]"}</span>
                        <Code2 className="w-6 h-6 stroke-[2.5]" />
                      </div>
                      <div className="space-y-2">
                        <span
                          className={`text-[10px] font-mono ${
                            isVenomMode ? "text-white" : "text-[#E62229]"
                          }`}
                        >
                          ALGORITHMS // OLYMPIAD
                        </span>
                        <h4 className="text-lg font-black text-white uppercase">
                          {isVenomMode ? "Neural Hive Lab" : "Competitive CP Lab"}
                        </h4>
                        <p className="text-xs text-[#cccccc]">
                          Dynamic Programming & Tree Traversal
                        </p>
                      </div>
                      <div className="text-[10px] text-[#888888] border-t border-white/20 pt-2">
                        BATCH B-01 // CLASSES 6-10
                      </div>
                    </div>
                  }
                  pixelColor={isVenomMode ? "#FFFFFF" : "#E62229"}
                  gridSize={12}
                  pixelShape="square"
                  gap={0}
                  pattern="random"
                  pixelAnimation="pop"
                  trigger="hover"
                  aspectRatio="100%"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="text-[11px] text-center text-[#aaaaaa]">
                Interactive Dual-State: Hover card to explode and reconstitute pixel matrix.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* =========================================================================
          SECTION 02: [CORP // 02: CLUB EVENTS & WORKSHOPS]
          ========================================================================= */}
      <ScrollReveal className="space-y-8">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 pb-4 transition-colors duration-500 ${
            isVenomMode ? "border-white" : "border-[#E62229]"
          }`}
        >
          <div>
            <span
              className={`text-xs font-black tracking-widest ${
                isVenomMode ? "text-white" : "text-[#E62229]"
              }`}
            >
              {isVenomMode
                ? "[HIVE // 02 // LAB TIMETABLE]"
                : "[CORP // 02 // LAB TIMETABLE]"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
              {isVenomMode ? "Corrupted Events & Workshops" : "Club Events & Workshops"}
            </h2>
          </div>
          <Link
            href="/events"
            className={`text-xs font-black flex items-center gap-1 transition-colors ${
              isVenomMode
                ? "text-white hover:underline"
                : "text-[#F5E8C7] hover:text-[#E62229]"
            }`}
          >
            <span>ALL EVENTS</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.length > 0 ? (
            events.map((event) => (
              <StaggerItem key={event.id}>
                <motion.article
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`border-2 p-6 space-y-4 flex flex-col justify-between transition-shadow h-full ${
                    isVenomMode
                      ? "border-white bg-[#0A0A0A] shadow-[6px_6px_0px_#FFFFFF]"
                      : "border-[#E62229] bg-[#081726] shadow-[6px_6px_0px_#E62229]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span
                        className={`px-2 py-0.5 tracking-wider ${
                          isVenomMode
                            ? "bg-white text-black font-black"
                            : "bg-[#E62229] text-black"
                        }`}
                      >
                        {event.event_type}
                      </span>
                      <span className="text-[#F5E8C7] text-[11px] flex items-center gap-1">
                        <Clock
                          className={`w-3 h-3 ${
                            isVenomMode ? "text-white" : "text-[#E62229]"
                          }`}
                        />
                        {formatDate(event.event_date)}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-xs text-[#aaaaaa] leading-relaxed">
                      {event.summary || event.details || "Official club workshop session conducted in Room 312."}
                    </p>
                  </div>

                  <div
                    className={`pt-4 border-t flex items-center justify-between text-xs font-black ${
                      isVenomMode ? "border-white/30" : "border-[#E62229]/30"
                    }`}
                  >
                    <span className="flex items-center gap-1 text-[#F5E8C7]">
                      <MapPin
                        className={`w-3.5 h-3.5 ${
                          isVenomMode ? "text-white" : "text-[#E62229]"
                        }`}
                      />
                      {event.location || "Room 312"}
                    </span>
                    <Link
                      href="/events"
                      className={`hover:underline ${
                        isVenomMode ? "text-white" : "text-[#E62229]"
                      }`}
                    >
                      DETAILS →
                    </Link>
                  </div>
                </motion.article>
              </StaggerItem>
            ))
          ) : (
            <>
              <StaggerItem>
                <article
                  className={`border-2 p-6 space-y-4 h-full flex flex-col justify-between ${
                    isVenomMode
                      ? "border-white bg-[#0A0A0A] shadow-[6px_6px_0px_#FFFFFF]"
                      : "border-[#E62229] bg-[#081726] shadow-[6px_6px_0px_#E62229]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span
                        className={`px-2 py-0.5 ${
                          isVenomMode
                            ? "bg-white text-black"
                            : "bg-[#E62229] text-black"
                        }`}
                      >
                        WORKSHOP
                      </span>
                      <span className="text-[#F5E8C7] text-[11px]">ROOM 312</span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      Batch Induction & Microcontroller Pinouts
                    </h3>
                    <p className="text-xs text-[#aaaaaa] leading-relaxed">
                      Hands-on orientation for Class 6–8 members covering Arduino board pinouts, sensors, and club ethics.
                    </p>
                  </div>
                  <div
                    className={`pt-4 border-t text-xs font-black ${
                      isVenomMode
                        ? "border-white/30 text-white"
                        : "border-[#E62229]/30 text-[#E62229]"
                    }`}
                  >
                    LAB: ROOM 312 // SATURDAY
                  </div>
                </article>
              </StaggerItem>

              <StaggerItem>
                <article
                  className={`border-2 p-6 space-y-4 h-full flex flex-col justify-between ${
                    isVenomMode
                      ? "border-white bg-[#0A0A0A] shadow-[6px_6px_0px_#FFFFFF]"
                      : "border-[#E62229] bg-[#081726] shadow-[6px_6px_0px_#E62229]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span
                        className={`px-2 py-0.5 ${
                          isVenomMode
                            ? "bg-white text-black"
                            : "bg-[#E62229] text-black"
                        }`}
                      >
                        CP CONTEST
                      </span>
                      <span className="text-[#F5E8C7] text-[11px]">ONLINE LAB</span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      Intra-School Programming Round 01
                    </h3>
                    <p className="text-xs text-[#aaaaaa] leading-relaxed">
                      Timed competitive contest testing algorithmic thinking, sorting logic, and basic data manipulation.
                    </p>
                  </div>
                  <div
                    className={`pt-4 border-t text-xs font-black ${
                      isVenomMode
                        ? "border-white/30 text-white"
                        : "border-[#E62229]/30 text-[#E62229]"
                    }`}
                  >
                    PORTAL // VIRTUAL CONTEST
                  </div>
                </article>
              </StaggerItem>

              <StaggerItem>
                <article
                  className={`border-2 p-6 space-y-4 h-full flex flex-col justify-between ${
                    isVenomMode
                      ? "border-white bg-[#0A0A0A] shadow-[6px_6px_0px_#FFFFFF]"
                      : "border-[#E62229] bg-[#081726] shadow-[6px_6px_0px_#E62229]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-black">
                      <span
                        className={`px-2 py-0.5 ${
                          isVenomMode
                            ? "bg-white text-black"
                            : "bg-[#E62229] text-black"
                        }`}
                      >
                        ROBOTICS LAB
                      </span>
                      <span className="text-[#F5E8C7] text-[11px]">ROOM 312</span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      Autonomous Rover Assembly & Telemetry
                    </h3>
                    <p className="text-xs text-[#aaaaaa] leading-relaxed">
                      Building dual-motor obstacle avoidance rovers with ultrasonic sensors and H-bridge motor drivers.
                    </p>
                  </div>
                  <div
                    className={`pt-4 border-t text-xs font-black ${
                      isVenomMode
                        ? "border-white/30 text-white"
                        : "border-[#E62229]/30 text-[#E62229]"
                    }`}
                  >
                    HARDWARE // SOLDERING LAB
                  </div>
                </article>
              </StaggerItem>
            </>
          )}
        </StaggerGroup>
      </ScrollReveal>

      {/* =========================================================================
          SECTION 03: [CORP // 03: PERSONNEL DIRECTORY // EXECUTIVES]
          ========================================================================= */}
      <ScrollReveal className="space-y-8">
        <div
          className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 pb-4 transition-colors duration-500 ${
            isVenomMode ? "border-white" : "border-[#E62229]"
          }`}
        >
          <div>
            <span
              className={`text-xs font-black tracking-widest ${
                isVenomMode ? "text-white" : "text-[#E62229]"
              }`}
            >
              {isVenomMode
                ? "[HIVE // 03 // SYMBIOTE HOST DIRECTORY]"
                : "[CORP // 03 // LEADERSHIP DIRECTORY]"}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
              {isVenomMode ? "Infected Hive Hosts & Mentors" : "Club Executives & Mentors"}
            </h2>
          </div>
          <Link
            href="/team"
            className={`text-xs font-black flex items-center gap-1 transition-colors ${
              isVenomMode
                ? "text-white hover:underline"
                : "text-[#F5E8C7] hover:text-[#E62229]"
            }`}
          >
            <span>FULL COMMITTEE DIRECTORY</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
          </Link>
        </div>

        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.length > 0 ? (
            team.map((member, idx) => (
              <StaggerItem key={idx}>
                <CyberMemberBadge
                  id={`PRC-${String(idx + 1).padStart(2, "0")}`}
                  name={member.full_name}
                  role={member.position_title || member.team_role}
                  affiliation="Room 312"
                  level={`0${idx + 1}`}
                />
              </StaggerItem>
            ))
          ) : (
            <>
              <StaggerItem>
                <CyberMemberBadge
                  id="PRC-01"
                  name="Tahjibul Islam Robi"
                  role="President"
                  affiliation="Room 312"
                  level="01"
                />
              </StaggerItem>

              <StaggerItem>
                <CyberMemberBadge
                  id="PRC-02"
                  name="Rafan Haizar"
                  role="Vice President"
                  affiliation="Room 312"
                  level="02"
                />
              </StaggerItem>

              <StaggerItem>
                <CyberMemberBadge
                  id="PRC-03"
                  name="Adnan Samir"
                  role="General Secretary"
                  affiliation="Room 312"
                  level="03"
                />
              </StaggerItem>

              <StaggerItem>
                <CyberMemberBadge
                  id="PRC-04"
                  name="Md Tamzid Alahi"
                  role="Head Technical Trainer"
                  affiliation="Room 312"
                  level="04"
                />
              </StaggerItem>

              <StaggerItem>
                <CyberMemberBadge
                  id="PRC-05"
                  name="Joint Secretary"
                  role="Administration"
                  affiliation="Room 312"
                  level="05"
                />
              </StaggerItem>

              <StaggerItem>
                <CyberMemberBadge
                  id="PRC-06"
                  name="IT & Systems Secretary"
                  role="Systems Architecture"
                  affiliation="Room 312"
                  level="06"
                />
              </StaggerItem>
            </>
          )}
        </StaggerGroup>
      </ScrollReveal>

      {/* =========================================================================
          SECTION 04: [CORP // 04: MANUAL ADMISSION PROTOCOL]
          ========================================================================= */}
      <ScrollReveal>
        <section
          className={`border-4 p-8 sm:p-14 space-y-8 relative overflow-hidden transition-all duration-500 ${
            isVenomMode
              ? "border-white bg-[#000000] shadow-[10px_10px_0px_#FFFFFF]"
              : "border-[#E62229] bg-[#081726] shadow-[10px_10px_0px_#E62229]"
          }`}
        >
          <div className="max-w-2xl space-y-3">
            <span
              className={`text-xs font-black tracking-widest ${
                isVenomMode ? "text-white" : "text-[#E62229]"
              }`}
            >
              {isVenomMode
                ? "[HIVE // 04 // ASSIMILATION PROTOCOL]"
                : "[CORP // 04 // HOW TO JOIN]"}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              {isVenomMode ? "Bond with the Hive." : "Join the Club."}
            </h2>
            <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed">
              Membership forms are collected manually in Room 312. Verified applicants receive a unique club code after administrative verification. Open to all students in Classes 6 through 10.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <motion.div
              whileHover={{ y: -3 }}
              className={`p-5 border-2 space-y-2 ${
                isVenomMode
                  ? "border-white/30 bg-[#0A0A0A] shadow-[4px_4px_0px_#FFFFFF]"
                  : "border-white/20 bg-[#04080D] shadow-[4px_4px_0px_#E62229]"
              }`}
            >
              <span
                className={`font-black text-sm ${
                  isVenomMode ? "text-white" : "text-[#E62229]"
                }`}
              >
                STEP 01
              </span>
              <p className="text-white font-black text-sm">Collect Physical Form</p>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                Visit Room 312 during regular club lab hours to collect the application slip.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className={`p-5 border-2 space-y-2 ${
                isVenomMode
                  ? "border-white/30 bg-[#0A0A0A] shadow-[4px_4px_0px_#FFFFFF]"
                  : "border-white/20 bg-[#04080D] shadow-[4px_4px_0px_#E62229]"
              }`}
            >
              <span
                className={`font-black text-sm ${
                  isVenomMode ? "text-white" : "text-[#E62229]"
                }`}
              >
                STEP 02
              </span>
              <p className="text-white font-black text-sm">Admin Verification</p>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                Submit completed form with parent/guardian approval and student identity details.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -3 }}
              className={`p-5 border-2 space-y-2 ${
                isVenomMode
                  ? "border-white/30 bg-[#0A0A0A] shadow-[4px_4px_0px_#FFFFFF]"
                  : "border-white/20 bg-[#04080D] shadow-[4px_4px_0px_#E62229]"
              }`}
            >
              <span
                className={`font-black text-sm ${
                  isVenomMode ? "text-white" : "text-[#E62229]"
                }`}
              >
                STEP 03
              </span>
              <p className="text-white font-black text-sm">Receive Verified Club Code</p>
              <p className="text-[11px] text-[#888888] leading-relaxed">
                Get authenticated credentials to unlock the Batch Portal and learning archives.
              </p>
            </motion.div>
          </div>

          <div className="pt-2">
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                href="/join"
                className={`text-sm sm:text-base py-3.5 px-8 font-black tracking-wider transition-all ${
                  isVenomMode
                    ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                    : "btn-cyber-primary shadow-[5px_5px_0px_#000000]"
                }`}
              >
                <span>{isVenomMode ? "ASSIMILATE INTO THE HIVE ↗" : "READ ADMISSION RULES & JOIN ↗"}</span>
              </Link>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* =========================================================================
          SECTION 05: [CORP // 05: TECHNICAL FREQUENTLY ASKED QUESTIONS]
          ========================================================================= */}
      <ScrollReveal className="space-y-6">
        <div
          className={`border-b-4 pb-4 transition-colors duration-500 ${
            isVenomMode ? "border-white" : "border-[#E62229]"
          }`}
        >
          <span
            className={`text-xs font-black tracking-widest ${
              isVenomMode ? "text-white" : "text-[#E62229]"
            }`}
          >
            {isVenomMode
              ? "[HIVE // 05 // SYMBIOTE INQUIRIES]"
              : "[CORP // 05 // SYSTEM INQUIRIES]"}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {CLUB_FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className={`border-2 overflow-hidden transition-all ${
                  isVenomMode
                    ? "border-white bg-[#0A0A0A] shadow-[4px_4px_0px_#FFFFFF]"
                    : "border-[#E62229] bg-[#081726] shadow-[4px_4px_0px_#E62229]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className={`w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-black text-sm sm:text-base text-white transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  <span>{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`p-1 border bg-black shrink-0 ${
                      isVenomMode
                        ? "border-white text-white"
                        : "border-[#E62229] text-[#E62229]"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <div
                        className={`px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-[#cccccc] leading-relaxed border-t ${
                          isVenomMode ? "border-white/20" : "border-[#E62229]/30"
                        }`}
                      >
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </ScrollReveal>
    </div>
  );
}
