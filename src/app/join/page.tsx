"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  MapPin,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { SitePage } from "@/lib/types";

export default function JoinPage() {
  const [page, setPage] = useState<SitePage | null>(null);
  const [eligibilityClass, setEligibilityClass] = useState<string>("8");
  const [hasTakenPreTest, setHasTakenPreTest] = useState<boolean>(false);

  useEffect(() => {
    async function loadJoin() {
      try {
        const { data } = await supabase.rpc("get_public_site_pages");
        if (data) {
          const p = data.find((item: SitePage) => item.slug === "join");
          if (p) setPage(p);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadJoin();
  }, []);

  const isClass10 = eligibilityClass === "10";
  const isEligible = !isClass10 || !hasTakenPreTest;

  return (
    <div className="space-y-12">
      {/* =========================================================================
          HERO POSTER: CYBER ADMISSION PROTOCOL
          ========================================================================= */}
      <section className="border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// ADMISSION PROTOCOL // MANUAL VERIFICATION // ROOM 312
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="bg-black text-[#E62229] px-2 py-0.5 border border-black">VENUE: ROOM_312</span>
            <span className="bg-black text-white px-2 py-0.5 border border-black">FEES: 0.00 BDT (FREE)</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#081726] text-[#F5E8C7] space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#E62229] pb-6">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#E62229] uppercase">
                ENROLLMENT // CLASSES 6 THROUGH 10
              </span>
              <h1 className="text-4xl sm:text-6xl font-mech-wide font-black text-white tracking-wide">
                {page?.title || "HOW TO JOIN"}
              </h1>
              <p className="text-xs sm:text-sm text-[#cccccc] max-w-xl">
                {page?.subtitle ||
                  "Admission forms are collected manually in person inside Room 312. No online financial transactions or automated payments exist."}
              </p>
            </div>

            <div className="border-2 border-[#E62229] bg-[#04080D] p-4 text-center shrink-0 shadow-[4px_4px_0px_#E62229]">
              <span className="text-xs font-mono text-[#aaaaaa] block">TUITION & WORKSHOPS</span>
              <span className="text-2xl font-black text-[#00FF66] block">100% FREE</span>
              <span className="text-[10px] text-[#aaaaaa] font-mono">PROVIDED BY CLUB</span>
            </div>
          </div>

          {/* Hazard Divider */}
          <div className="h-5 w-full hazard-stripes border-t border-b border-[#F5E8C7]/60" />
        </div>
      </section>

      {/* =========================================================================
          THE 4-STEP PHYSICAL PROTOCOL (CYBER CARDS)
          ========================================================================= */}
      <ScrollReveal className="space-y-6">
        <div className="border-b-4 border-[#E62229] pb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-[#E62229]" />
            <span>4-Step Physical Admission Sequence</span>
          </h2>
          <span className="text-xs font-mono text-[#F5E8C7]">PROTOCOL VERIFIED</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#000000] space-y-3">
            <div className="w-8 h-8 bg-[#E62229] text-black font-black flex items-center justify-center text-xs">
              01
            </div>
            <h3 className="text-base font-black text-white uppercase">Collect Form</h3>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              Obtain the official printed registration slip in person from Room 312 during school break or official club hours.
            </p>
            <span className="text-[10px] font-mono text-[#E62229] font-bold block pt-2">
              PHYSICAL SLIP ONLY
            </span>
          </div>

          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#000000] space-y-3">
            <div className="w-8 h-8 bg-[#E62229] text-black font-black flex items-center justify-center text-xs">
              02
            </div>
            <h3 className="text-base font-black text-white uppercase">Complete Data</h3>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              Fill in student name, class grade (6 to 10), roll number, section, emergency guardian contact, and primary field of interest (Code or Hardware).
            </p>
            <span className="text-[10px] font-mono text-[#E62229] font-bold block pt-2">
              GUARDIAN CONSENT
            </span>
          </div>

          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#000000] space-y-3">
            <div className="w-8 h-8 bg-[#E62229] text-black font-black flex items-center justify-center text-xs">
              03
            </div>
            <h3 className="text-base font-black text-white uppercase">Return Slip</h3>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              Hand the signed form back to an authorized Executive Committee member in Room 312 for committee review and administrative endorsement.
            </p>
            <span className="text-[10px] font-mono text-[#E62229] font-bold block pt-2">
              VERIFICATION DESK
            </span>
          </div>

          <div className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#000000] space-y-3">
            <div className="w-8 h-8 bg-[#E62229] text-black font-black flex items-center justify-center text-xs">
              04
            </div>
            <h3 className="text-base font-black text-white uppercase">Receive ID</h3>
            <p className="text-xs text-[#cccccc] leading-relaxed">
              Once verified, receive your unique alphanumeric club ID. Use this ID to unlock digital batch materials, slides, and contest roster tracking.
            </p>
            <span className="text-[10px] font-mono text-[#E62229] font-bold block pt-2">
              ACCESS GRANTED
            </span>
          </div>
        </div>
      </ScrollReveal>

      {/* =========================================================================
          INTERACTIVE ELIGIBILITY CHECKER
          ========================================================================= */}
      <ScrollReveal className="border-4 border-[#E62229] bg-[#04080D] p-6 sm:p-8 shadow-[8px_8px_0px_#E62229] space-y-6">
        <div className="border-b-2 border-[#E62229] pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-[#E62229] font-black tracking-widest block">
              [AUTOMATED_CHECKER // VERIFICATION_UNIT]
            </span>
            <h3 className="text-2xl font-black text-white uppercase">
              Eligibility Verification Terminal
            </h3>
          </div>
          <span className="text-xs font-mono text-[#F5E8C7]">CHECK STATUS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#F5E8C7] uppercase mb-2">
                1. Select Enrolled Class:
              </label>
              <div className="grid grid-cols-5 gap-2">
                {["6", "7", "8", "9", "10"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setEligibilityClass(c)}
                    className={`py-2 text-xs font-black uppercase transition-all ${
                      eligibilityClass === c
                        ? "bg-[#E62229] text-black shadow-[2px_2px_0px_#000000] border-2 border-black"
                        : "bg-[#081726] text-[#F5E8C7] border border-[#E62229]/40 hover:bg-[#E62229]/20"
                    }`}
                  >
                    Class {c}
                  </button>
                ))}
              </div>
            </div>

            {isClass10 && (
              <div className="border-2 border-[#E62229] bg-[#081726] p-4 space-y-2">
                <label className="block text-xs font-mono font-bold text-white uppercase">
                  2. Have you appeared in School Pre-Test Exams?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setHasTakenPreTest(false)}
                    className={`px-4 py-1.5 text-xs font-black uppercase transition-all ${
                      !hasTakenPreTest
                        ? "bg-[#00FF66] text-black"
                        : "bg-[#04080D] text-[#aaaaaa] border border-white/20"
                    }`}
                  >
                    No (Not Yet)
                  </button>
                  <button
                    onClick={() => setHasTakenPreTest(true)}
                    className={`px-4 py-1.5 text-xs font-black uppercase transition-all ${
                      hasTakenPreTest
                        ? "bg-[#E62229] text-black"
                        : "bg-[#04080D] text-[#aaaaaa] border border-white/20"
                    }`}
                  >
                    Yes (Completed)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Outcome Status Panel */}
          <div className="border-2 border-[#E62229] bg-[#081726] p-6 space-y-4 shadow-[4px_4px_0px_#000000]">
            <div className="flex items-center gap-3">
              {isEligible ? (
                <CheckCircle2 className="w-8 h-8 text-[#00FF66] shrink-0" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-[#E62229] shrink-0" />
              )}
              <div>
                <span className="text-[10px] font-mono uppercase text-[#aaaaaa] block">
                  CANDIDATE ADMISSION STATUS
                </span>
                <h4
                  className={`text-xl font-black uppercase ${
                    isEligible ? "text-[#00FF66]" : "text-[#E62229]"
                  }`}
                >
                  {isEligible ? "ELIGIBLE FOR ADMISSION" : "REGISTRATION CLOSED"}
                </h4>
              </div>
            </div>

            <p className="text-xs text-[#cccccc] leading-relaxed">
              {isEligible
                ? `You are fully eligible to join CMHS PRC as a Class ${eligibilityClass} member! Visit Room 312 to collect your physical admission slip.`
                : "Per club constitution (Article 01, Section 03), Class 10 candidates cannot register after pre-test examinations so they can dedicate full focus to SSC board examinations."}
            </p>

            {isEligible ? (
              <div className="flex items-center gap-2 text-xs font-mono text-[#00FF66] border-t border-[#E62229]/40 pt-3">
                <MapPin className="w-4 h-4" />
                <span>Next Step: Report to Room 312 for Registration Slip</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono text-[#E62229] border-t border-[#E62229]/40 pt-3">
                <ShieldAlert className="w-4 h-4" />
                <span>Academic Board Preparation Exception Enforced</span>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
