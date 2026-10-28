"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Shield, Terminal, QrCode } from "lucide-react";
import { FacebookIcon, GithubIcon } from "./BrandIcons";
import { useVenom } from "./VenomProvider";

export function Footer() {
  const { isVenomMode, revertToSpidey } = useVenom();

  return (
    <footer
      className={`w-full border-t-4 transition-colors duration-500 font-mono text-xs mt-32 ${
        isVenomMode
          ? "border-white bg-[#000000] text-white"
          : "border-[#E62229] bg-[#04080D] text-[#F5E8C7]"
      }`}
    >
      {/* Top Warning Strip */}
      <div
        className={`w-full font-black text-xs px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b-2 transition-colors duration-500 ${
          isVenomMode
            ? "bg-[#0A0A0A] text-white border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            : "bg-[#E62229] text-black border-black"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="tracking-widest">
            {isVenomMode
              ? "/// SYMBIOTE ASSIMILATION COMPLETE · ROOM 312"
              : "/// CUMILLA MODERN HIGH SCHOOL · PROGRAMMING & ROBOTICS CLUB"}
          </span>
        </div>
        <div className="flex items-center gap-6 text-[11px] tracking-wider">
          <span>ROOM: 312</span>
          <span>{isVenomMode ? "HOST: ALL CLASSES" : "CLASSES: 06–10"}</span>
          <span>
            STATUS: {isVenomMode ? "INFECTED" : "ONLINE"}
            {isVenomMode && (
              <button
                type="button"
                onClick={revertToSpidey}
                className="ml-3 underline hover:text-neutral-300 font-black cursor-pointer"
              >
                [PURGE SYMBIOTE]
              </button>
            )}
          </span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Identity & Barcode */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 border-2 p-1 transition-all ${
                  isVenomMode
                    ? "border-white bg-black shadow-[2px_2px_0px_#FFFFFF]"
                    : "border-[#E62229] bg-black shadow-[2px_2px_0px_#E62229]"
                }`}
              >
                <Image
                  src="/assets/brand/cmhs-prc-profile.svg"
                  alt="CMHS PRC"
                  width={28}
                  height={28}
                  className={`object-contain ${
                    isVenomMode ? "filter drop-shadow-[0_0_8px_#FFFFFF] brightness-125" : ""
                  }`}
                />
              </div>
              <div>
                <span className="font-black text-sm tracking-wider text-white block">
                  {isVenomMode ? "/// WE ARE VENOM // 312" : "CMHS PRC // ROOM 312"}
                </span>
                <span className="text-[10px] text-[#aaaaaa] tracking-normal block">
                  {isVenomMode
                    ? "Alien Symbiote Infiltration Laboratory"
                    : "Cumilla Modern High School Robotics"}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#cccccc] leading-relaxed max-w-sm">
              {isVenomMode
                ? "The extraterrestrial organism has bonded with Room 312 hardware. Algorithmic telemetry and cyber-neural networks operate under symbiote command."
                : "Extracurricular engineering initiative specializing in competitive programming (C++/Python), physical telemetry rovers, and building digital tools for student developers."}
            </p>

            {/* Industrial Barcode */}
            <div className="space-y-1 pt-2">
              <div className="h-9 w-full max-w-xs barcode-pattern opacity-80 border-t border-b border-[#F5E8C7]/30" />
              <div className="flex justify-between text-[9px] text-[#aaaaaa] max-w-xs font-mono font-bold">
                <span>ESTABLISHED: 2024</span>
                <span>ROOM: 312</span>
                <span>MEMBERS: 6–10</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className={`p-2 border transition-colors ${
                  isVenomMode
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-[#E62229] text-[#E62229] hover:bg-[#E62229] hover:text-black"
                }`}
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/Tahjibul-islam-robi/cmhsprcdatabase"
                target="_blank"
                rel="noreferrer"
                className={`p-2 border transition-colors ${
                  isVenomMode
                    ? "border-white text-white hover:bg-white hover:text-black"
                    : "border-[#E62229] text-[#E62229] hover:bg-[#E62229] hover:text-black"
                }`}
                aria-label="GitHub"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4
              className={`font-black tracking-widest text-xs border-b pb-1 uppercase ${
                isVenomMode ? "text-white border-white" : "text-white border-[#E62229]"
              }`}
            >
              [NAVIGATION]
            </h4>
            <ul className="space-y-2 text-[#cccccc] text-xs">
              <li>
                <Link
                  href="/"
                  className={`transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  &gt; 01. Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={`transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  &gt; 02. About Mission
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className={`transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  &gt; 03. Events & Timetable
                </Link>
              </li>
              <li>
                <Link
                  href="/batch-portal"
                  className={`transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  &gt; 04. Batch Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className={`transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  &gt; 05. Class Materials & Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className={`transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  &gt; 06. Executive Committee
                </Link>
              </li>
              <li>
                <Link
                  href="/rules"
                  className={`transition-colors ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  &gt; 07. Club Constitution
                </Link>
              </li>
            </ul>
          </div>

          {/* Club Services */}
          <div className="md:col-span-4 space-y-3">
            <h4
              className={`font-black tracking-widest text-xs border-b pb-1 uppercase ${
                isVenomMode ? "text-white border-white" : "text-white border-[#E62229]"
              }`}
            >
              [CLUB SERVICES]
            </h4>
            <ul className="space-y-2 text-[#cccccc] text-xs">
              <li>
                <Link
                  href="/batch-portal"
                  className={`transition-colors flex items-center justify-between ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  <span>&gt; Batch Portal (Classes 6–10)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/join"
                  className={`transition-colors flex items-center justify-between ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  <span>&gt; Physical Admission Protocol</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className={`transition-colors flex items-center justify-between ${
                    isVenomMode ? "hover:text-white" : "hover:text-[#E62229]"
                  }`}
                >
                  <span>&gt; Administrator Verification</span>
                  <Shield
                    className={`w-3.5 h-3.5 ${
                      isVenomMode ? "text-white" : "text-[#E62229]"
                    }`}
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Hazard Divider */}
        <div
          className={`h-4 w-full mb-6 ${
            isVenomMode ? "hazard-stripes opacity-90" : "hazard-stripes-red opacity-60"
          }`}
        />

        {/* Bottom Metadata */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#aaaaaa] text-[11px]">
          <div>
            © 2024–2026 Cumilla Modern High School Programming & Robotics Club. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[#F5E8C7]">
            <span>ROOM 312</span>
            <span>·</span>
            <span>CAMPUS HEADQUARTERS</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
