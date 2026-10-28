"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Shield,
  Cpu,
  Code2,
  Terminal,
  Activity,
  Layers,
  Award,
  Users,
  Compass,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { SitePage } from "@/lib/types";

export default function AboutPage() {
  const [page, setPage] = useState<SitePage | null>(null);

  useEffect(() => {
    async function loadAbout() {
      try {
        const { data } = await supabase.rpc("get_public_site_pages");
        if (data) {
          const about = data.find((p: SitePage) => p.slug === "about");
          if (about) setPage(about);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadAbout();
  }, []);

  return (
    <div className="space-y-16">
      {/* =========================================================================
          HERO POSTER: CYBERPUNK MECH-BRUTALIST DOSSIER
          ========================================================================= */}
      <section className="border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Top Technical Warning Header */}
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// DOSSIER 02 // CUMILLA MODERN HIGH SCHOOL PRC
            </span>
          </div>
          <div className="flex items-center gap-6 text-[11px]">
            <span>NODE: ROOM_312</span>
            <span>CLEARANCE: GENERAL_STUDENT</span>
          </div>
        </div>

        {/* 2-Column Dossier Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-4 lg:divide-y-0 lg:divide-x-4 divide-[#E62229]">
          {/* Left Red Identity Cell */}
          <div className="lg:col-span-4 bg-[#E62229] text-black p-6 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest block border-b-2 border-black pb-1">
                ORIGIN // EST. 2024
              </span>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none uppercase">
                {page?.title || "ABOUT PRC"}
              </h1>
            </div>

            {/* Official Robot Profile Card */}
            <div className="border-4 border-black bg-[#04080D] p-5 shadow-[5px_5px_0px_#000000] space-y-4">
              <div className="relative aspect-square w-full bg-black border-2 border-[#E62229] p-4 flex items-center justify-center">
                <Image
                  src="/assets/brand/cmhs-prc-profile.svg"
                  alt="CMHS PRC Robot"
                  width={160}
                  height={160}
                  className="object-contain filter drop-shadow-[0_0_12px_rgba(230,34,41,0.8)]"
                  priority
                />
              </div>
              <div className="text-[#F5E8C7] text-xs space-y-1">
                <span className="font-black text-[#E62229] tracking-widest block">
                  EST. 2024 // ROOM 312 // CMHS PRC
                </span>
                <p className="text-[11px] text-[#aaaaaa]">
                  Official insignia of Cumilla Modern High School Programming & Robotics Club.
                </p>
              </div>
            </div>

            {/* Barcode Strip */}
            <div className="space-y-1">
              <div className="h-8 w-full barcode-pattern-red border-t-2 border-b-2 border-black" />
              <div className="flex justify-between text-[10px] font-black text-black">
                <span>CAMPUS: CMHS</span>
                <span>ROOM: 312</span>
              </div>
            </div>
          </div>

          {/* Right Navy Stage */}
          <div className="lg:col-span-8 bg-[#081726] text-[#F5E8C7] p-6 sm:p-10 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#E62229] font-black tracking-widest border-b border-[#E62229]/40 pb-2">
                <span>/// MISSION STATEMENT // EXECUTIVE CHARTER</span>
                <span>STATUS: ACTIVE</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-mech-wide font-black tracking-wide text-white">
                {page?.subtitle || "TECHNOLOGY BY STUDENTS, FOR STUDENTS."}
              </h2>

              {/* Diagonal Hazard Stripes */}
              <div className="h-6 w-full hazard-stripes border-t-2 border-b-2 border-[#F5E8C7]" />
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-[#cccccc] leading-relaxed max-w-3xl">
              <p>
                Founded inside <strong className="text-white">Room 312</strong> of Cumilla Modern High School, the Programming and Robotics Club (PRC) is a student-founded and student-operated initiative. We bridge classroom curiosity with industrial computer science and practical hardware engineering.
              </p>
              <p>
                Our members—enrolled in <strong className="text-[#F5E8C7]">Classes 6 through 10</strong>—engage in structured competitive programming practice, build autonomous micro-controllers and sonar telemetry rovers, and design real-world software systems.
              </p>
            </div>

            {/* Technical Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t-2 border-[#E62229]">
              <div className="border-2 border-[#E62229] bg-[#04080D] p-3 text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#E62229] block">312</span>
                <span className="text-[10px] font-mono text-[#F5E8C7] tracking-wider uppercase">Headquarters</span>
              </div>
              <div className="border-2 border-[#E62229] bg-[#04080D] p-3 text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#E62229] block">06–10</span>
                <span className="text-[10px] font-mono text-[#F5E8C7] tracking-wider uppercase">Target Classes</span>
              </div>
              <div className="border-2 border-[#E62229] bg-[#04080D] p-3 text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#E62229] block">100%</span>
                <span className="text-[10px] font-mono text-[#F5E8C7] tracking-wider uppercase">Free Access</span>
              </div>
              <div className="border-2 border-[#E62229] bg-[#04080D] p-3 text-center">
                <span className="text-2xl sm:text-3xl font-black text-[#E62229] block">24/7</span>
                <span className="text-[10px] font-mono text-[#F5E8C7] tracking-wider uppercase">Portal Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02: 4 CORE SYSTEM PILLARS
          ========================================================================= */}
      <ScrollReveal className="space-y-6">
        <div className="border-b-4 border-[#E62229] pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#E62229] font-black tracking-widest block">
              [SYSTEM_PILLARS // 04 MODULES]
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              What We Do Inside Room 312
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#E62229] space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-[#E62229]">
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4 stroke-[3]" />
                01. COMPETITIVE PROGRAMMING ACADEMY
              </span>
              <span>C++ // PYTHON</span>
            </div>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              We teach modern algorithmic fundamentals: arrays, string manipulation, sorting algorithms, recursion, graph traversal, and dynamic programming. Students train on VJudge, Codeforces, and national high school olympiads.
            </p>
          </div>

          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#E62229] space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-[#E62229]">
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 stroke-[3]" />
                02. EMBEDDED ROBOTICS & TELEMETRY LAB
              </span>
              <span>ARDUINO // SENSORS</span>
            </div>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              Hands-on physical hardware prototyping. Students learn breadboard circuit design, micro-controller programming, ultrasonic obstacle navigation, servo actuation, and Bluetooth motor telemetry.
            </p>
          </div>

          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#E62229] space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-[#E62229]">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 stroke-[3]" />
                03. DIGITAL BATCH PORTAL & ARCHIVE
              </span>
              <span>DATABASE // NOTES</span>
            </div>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              Every class batch receives curated digital lecture slides, sample code repositories, and contest problem archives accessible securely through the student batch portal.
            </p>
          </div>

          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#E62229] space-y-3">
            <div className="flex items-center justify-between text-xs font-black text-[#E62229]">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 stroke-[3]" />
                04. PEER MENTORSHIP & GOVERNANCE
              </span>
              <span>STUDENT LED</span>
            </div>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              Senior members mentor junior cohorts from Classes 6 and 7. The club is governed by an elected executive committee comprising President, Vice President, General Secretary, and verified Technical Trainers.
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* =========================================================================
          SECTION 03: HARDWARE LAB SPECIFICATIONS TABLE
          ========================================================================= */}
      <ScrollReveal className="space-y-6">
        <div className="border-b-4 border-[#E62229] pb-4">
          <span className="text-xs text-[#E62229] font-black tracking-widest block">
            [TECHNICAL_SPECIFICATIONS // LAB_DATA]
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Room 312 Hardware Specifications
          </h2>
        </div>

        <div className="border-2 border-[#E62229] bg-[#04080D] overflow-x-auto shadow-[6px_6px_0px_#000000]">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#E62229] text-black font-black uppercase border-b-2 border-black">
              <tr>
                <th className="p-3">Specification Parameter</th>
                <th className="p-3">Active Configuration</th>
                <th className="p-3">Governance / Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-[#F5E8C7]">
              <tr>
                <td className="p-3 font-bold text-white">Physical Location</td>
                <td className="p-3">Room 312, Cumilla Modern High School Campus</td>
                <td className="p-3 text-[#aaaaaa]">Authorized student access only</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Eligible Class Cohorts</td>
                <td className="p-3">Classes 6, 7, 8, 9, 10</td>
                <td className="p-3 text-[#aaaaaa]">Class 10 restricted post pre-tests</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Primary Programming Languages</td>
                <td className="p-3">C++20, Python 3.12, Arduino C</td>
                <td className="p-3 text-[#aaaaaa]">Competitive standard conformant</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Hardware Toolkits</td>
                <td className="p-3">Arduino UNO R3, ESP32, Ultrasonic Sonar, Motor Shields</td>
                <td className="p-3 text-[#aaaaaa]">Provided free in laboratory</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-white">Admission Cost</td>
                <td className="p-3 text-[#00FF66] font-bold">100% Free (No Tuition Fees)</td>
                <td className="p-3 text-[#aaaaaa]">Manual registration slip verification</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-wrap items-center gap-4">
          <Link href="/team" className="btn-cyber-primary text-xs">
            <span>INSPECT CLUB LEADERSHIP</span>
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          </Link>
          <Link href="/rules" className="btn-cyber-navy text-xs">
            <span>READ CLUB CONSTITUTION</span>
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
