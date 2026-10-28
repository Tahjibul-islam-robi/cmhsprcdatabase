"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  CheckCircle,
  ShieldCheck,
  Languages,
  ArrowLeft,
  ArrowUpRight,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

interface RuleSection {
  num: string;
  enTitle: string;
  bnTitle: string;
  rules: {
    no: string;
    en: string;
    bn: string;
  }[];
}

const SECTIONS: RuleSection[] = [
  {
    num: "01",
    enTitle: "Membership & Registration",
    bnTitle: "সদস্যপদ ও নিবন্ধন",
    rules: [
      {
        no: "01",
        en: "Every member must complete the physical admission process in Room 312 before participating as an authenticated club member.",
        bn: "নিবন্ধিত ক্লাব সদস্য হিসেবে কার্যক্রমে অংশগ্রহণের আগে প্রত্যেক শিক্ষার্থীকে রুম ৩১২-এ অফিসিয়াল রেজিস্ট্রেশন প্রক্রিয়া সম্পন্ন করতে হবে।",
      },
      {
        no: "02",
        en: "Members are expected to provide accurate personal and academic information during registration and keep contact details updated.",
        bn: "রেজিস্ট্রেশনের সময় শিক্ষার্থীদের সঠিক তথ্য প্রদান করতে হবে এবং যোগাযোগের বিবরণ সর্বদা হালনাগাদ রাখতে হবে।",
      },
      {
        no: "03",
        en: "Membership is strictly open to Classes 6 through 10. Class 10 students may not register after their school pre-test examinations so they can dedicate full focus to board preparations.",
        bn: "সদস্যপদ ৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষার্থীদের জন্য উন্মুক্ত। তবে প্রি-টেস্ট পরীক্ষার পর ১০ম শ্রেণির শিক্ষার্থীদের সদস্যপদ গ্রহণ করা হয় না যাতে তারা বোর্ড পরীক্ষায় মনোনিবেশ করতে পারে।",
      },
    ],
  },
  {
    num: "02",
    enTitle: "Room 312 Conduct & Discipline",
    bnTitle: "রুম ৩১২-এ আচরণ ও শৃঙ্খলা",
    rules: [
      {
        no: "01",
        en: "Members must behave respectfully toward teachers, executive authorities, volunteer trainers, and fellow students at all times.",
        bn: "শিক্ষক, ক্লাব পরিচালনা কর্তৃপক্ষ, প্রশিক্ষক এবং সহপাঠীদের প্রতি সর্বদা সম্মানজনক ও মার্জিত আচরণ প্রদর্শন করতে হবে।",
      },
      {
        no: "02",
        en: "Punctuality is strictly required for all laboratory sessions, competitive code contests, and workshops.",
        bn: "সমস্ত ল্যাব সেশন, প্রোগ্রামিং প্রতিযোগিতা এবং কর্মশালায় সময়ানুবর্তিতা কঠোরভাবে মেনে চলতে হবে।",
      },
      {
        no: "03",
        en: "Disruptive behavior, unsanctioned noise, or disregard for lab guidelines in Room 312 will lead to temporary suspension.",
        bn: "রুম ৩১২-এ বিশৃঙ্খলা সৃষ্টি করা বা ল্যাব নিয়ম লঙ্ঘন করলে সদস্যপদ সাময়িক স্থগিত করা হতে পারে।",
      },
    ],
  },
  {
    num: "03",
    enTitle: "Hardware Laboratory & Tool Safety",
    bnTitle: "হার্ডওয়্যার ল্যাব ও যন্ত্রপাতি সুরক্ষা",
    rules: [
      {
        no: "01",
        en: "Club equipment—including Arduino microcontrollers, ESP32 boards, soldering stations, sensors, and power supplies—must be handled with utmost care.",
        bn: "আর্ডুইনো, ইএসপি৩২ বোর্ড, সোল্ডারিং স্টেশন, সেন্সর এবং পাওয়ার সাপ্লাই অত্যন্ত সতর্কতার সাথে ব্যবহার করতে হবে।",
      },
      {
        no: "02",
        en: "No hardware tools or project components may leave Room 312 without explicit written authorization from the Executive Committee.",
        bn: "কার্যনির্বাহী কমিটির লিখিত অনুমতি ব্যতীত রুম ৩১২ থেকে কোনো যন্ত্রপাতি বাইরে নেওয়া সম্পূর্ণ নিষিদ্ধ।",
      },
      {
        no: "03",
        en: "Any hardware malfunction, short circuit, or damage must be reported immediately to a Trainer or Executive Member.",
        bn: "কোনো যন্ত্রপাতির ত্রুটি বা শর্ট সার্কিট ঘটলে তা অবিলম্বে প্রশিক্ষক বা কার্যনির্বাহী সদস্যকে জানাতে হবে।",
      },
    ],
  },
  {
    num: "04",
    enTitle: "Academic Priority & School Balance",
    bnTitle: "একাডেমিক অগ্রাধিকার ও ক্লাবের ভারসাম্য",
    rules: [
      {
        no: "01",
        en: "School academic studies must always remain every member's primary priority. Club sessions are designed to complement, never hinder, schoolwork.",
        bn: "বিদ্যালয়ের পাঠ্যক্রম সর্বদা প্রথম অগ্রাধিকার। ক্লাবের কার্যক্রম এমনভাবে সাজানো যা পড়াশোনায় কোনো ব্যাঘাত ঘটাবে না।",
      },
      {
        no: "02",
        en: "Members falling critically behind in academic exams may be given mandatory study leave from competitive contests until grades stabilize.",
        bn: "একাডেমিক পরীক্ষায় দুর্বল ফলাফলকারী সদস্যদের সাময়িকভাবে প্রতিযোগিতামূলক প্রোগ্রামিং থেকে স্টাডি লিভ দেওয়া হতে পারে।",
      },
    ],
  },
];

export default function RulesPage() {
  const [lang, setLang] = useState<"en" | "bn">("en");
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="space-y-12">
      {/* =========================================================================
          HERO POSTER: CYBER CONSTITUTION DOSSIER
          ========================================================================= */}
      <section className="border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// CONSTITUTION & PROTOCOL // CMHS PRC // ROOM 312
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="bg-black text-[#E62229] px-2 py-0.5 border border-black">DOC: CONST_2026</span>
            <span className="bg-black text-white px-2 py-0.5 border border-black">RATIFIED: CMHS_EXEC</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#081726] text-[#F5E8C7] space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#E62229] pb-6">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#E62229] uppercase">
                {lang === "en" ? "OFFICIAL CLUB GOVERNANCE" : "অফিসিয়াল ক্লাবের সংবিধান"}
              </span>
              <h1 className="text-4xl sm:text-6xl font-mech-wide font-black text-white tracking-wide">
                {lang === "en" ? "CONSTITUTION" : "নিয়ম ও বিধিমালা"}
              </h1>
              <p className="text-xs sm:text-sm text-[#cccccc] max-w-xl">
                {lang === "en"
                  ? "Binding code of conduct, laboratory safety protocols, and academic standards established for all student members of Cumilla Modern High School PRC."
                  : "কুমিল্লা মডার্ন হাই স্কুল প্রোগ্রামিং অ্যান্ড রোবটিক্স ক্লাবের সদস্যদের জন্য প্রযোজ্য বাধ্যতামূলক আচরণবিধি ও ল্যাব নিরাপত্তা নির্দেশিকা।"}
              </p>
            </div>

            {/* Bilingual Switcher */}
            <div className="flex items-center p-1 bg-[#04080D] border-2 border-[#E62229] shadow-[4px_4px_0px_#000000]">
              <button
                onClick={() => setLang("en")}
                className={`px-4 py-1.5 text-xs font-black uppercase transition-all ${
                  lang === "en"
                    ? "bg-[#E62229] text-black shadow-inner"
                    : "text-[#F5E8C7] hover:text-white"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang("bn")}
                className={`px-4 py-1.5 text-xs font-black uppercase transition-all ${
                  lang === "bn"
                    ? "bg-[#E62229] text-black shadow-inner"
                    : "text-[#F5E8C7] hover:text-white"
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* Hazard Divider */}
          <div className="h-5 w-full hazard-stripes border-t border-b border-[#F5E8C7]/60" />
        </div>
      </section>

      {/* =========================================================================
          CONSTITUTION ARTICLES (CYBER PANELS)
          ========================================================================= */}
      <div className="space-y-8">
        {SECTIONS.map((sec) => (
          <ScrollReveal
            key={sec.num}
            className="border-2 border-[#E62229] bg-[#081726] shadow-[6px_6px_0px_#000000] overflow-hidden"
          >
            {/* Section Header */}
            <div className="bg-[#04080D] border-b-2 border-[#E62229] p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-[#E62229] text-black font-black flex items-center justify-center text-xs">
                  {sec.num}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  {lang === "en" ? sec.enTitle : sec.bnTitle}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#E62229] font-black border border-[#E62229] px-2 py-0.5">
                ARTICLE // {sec.num}
              </span>
            </div>

            {/* Rules List */}
            <div className="p-5 sm:p-6 space-y-4 divide-y divide-[#E62229]/20">
              {sec.rules.map((r) => (
                <div key={r.no} className="pt-3 first:pt-0 flex items-start gap-3">
                  <span className="text-xs font-mono font-black text-[#E62229] shrink-0 mt-0.5">
                    §{sec.num}.{r.no}
                  </span>
                  <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed">
                    {lang === "en" ? r.en : r.bn}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* =========================================================================
          MEMBER COMPLIANCE ACKNOWLEDGEMENT
          ========================================================================= */}
      <ScrollReveal className="border-4 border-[#E62229] bg-[#04080D] p-6 sm:p-8 shadow-[8px_8px_0px_#E62229] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#E62229] pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#E62229]" />
            <h3 className="text-xl font-black text-white uppercase">
              Member Compliance Seal
            </h3>
          </div>
          <span className="text-xs font-mono text-[#F5E8C7]">ROOM 312 CERTIFIED</span>
        </div>

        <p className="text-xs sm:text-sm text-[#cccccc] leading-relaxed">
          By registering as an active student member of Cumilla Modern High School Programming & Robotics Club, each student agrees to strictly uphold these constitutional standards in Room 312, in competitions, and across all online forums.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-5 h-5 accent-[#E62229] rounded-none cursor-pointer"
            />
            <span className="text-xs font-bold text-white uppercase">
              I have read, understood, and agree to follow all club rules.
            </span>
          </label>

          <Link
            href="/join"
            className={`btn-cyber-primary text-xs ${
              !acknowledged ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <span>PROCEED TO ADMISSION PROTOCOL</span>
            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
