"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, Sparkles, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVenom } from "./VenomProvider";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_LINKS = [
  { label: "Home Base", href: "/", category: "Navigation" },
  { label: "About Mission & Lab", href: "/about", category: "Dossier" },
  { label: "Mission Dispatch Calendar", href: "/events", category: "Events" },
  { label: "Student Batch Portal", href: "/batch-portal", category: "Cohort" },
  { label: "Lecture Materials & Docs", href: "/blog", category: "Archives" },
  { label: "Club Executives & Mentors", href: "/team", category: "Leadership" },
  { label: "Club Constitution", href: "/rules", category: "Protocol" },
  { label: "Physical Admission Protocol", href: "/join", category: "Admissions" },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const { isVenomMode, triggerVenomAttack, revertToSpidey } = useVenom();

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    const lower = val.trim().toLowerCase();
    if (lower === "venom") {
      onClose();
      triggerVenomAttack();
    } else if (
      lower === "spider" ||
      lower === "spidey" ||
      lower === "purge" ||
      lower === "normal" ||
      lower === "exit" ||
      lower === "reset"
    ) {
      onClose();
      revertToSpidey();
    }
  };

  const filtered = QUICK_LINKS.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={`w-full max-w-xl border-4 overflow-hidden font-mono transition-all ${
              isVenomMode
                ? "border-white bg-[#0A0A0A] text-white shadow-[10px_10px_0px_#FFFFFF]"
                : "border-[#E62229] bg-[#081726] text-[#F5E8C7] shadow-[10px_10px_0px_#000000]"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`font-black px-4 py-2.5 flex items-center justify-between text-xs border-b-2 ${
                isVenomMode
                  ? "bg-white text-black border-black"
                  : "bg-[#E62229] text-black border-black"
              }`}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 stroke-[3]" />
                <span>
                  {isVenomMode ? "SYMBIOTE COMMAND ARCHIVE // ROOM 312" : "COMMAND SEARCH // ROOM 312"}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-0.5 hover:bg-black hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Box */}
            <div
              className={`p-4 border-b-2 flex items-center gap-3 ${
                isVenomMode
                  ? "border-white bg-[#000000]"
                  : "border-[#E62229] bg-[#04080D]"
              }`}
            >
              <Search
                className={`w-5 h-5 shrink-0 ${
                  isVenomMode ? "text-white" : "text-[#E62229]"
                }`}
              />
              <input
                type="text"
                autoFocus
                placeholder={isVenomMode ? "TYPE A QUERY (OR TRY 'SPIDER' TO PURGE)..." : "TYPE A QUERY (OR TRY 'VENOM')..."}
                value={query}
                onChange={handleInputChange}
                className="w-full bg-transparent text-sm text-white placeholder:text-[#666666] font-bold focus:outline-none uppercase"
              />
              <span
                className={`text-[10px] px-2 py-0.5 shrink-0 border ${
                  isVenomMode
                    ? "bg-black border-white/60 text-white"
                    : "bg-[#081726] border-[#E62229]/60 text-[#E62229]"
                }`}
              >
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-3 space-y-1">
              {/* One-click Venom Purge / Restore Button when in Venom Mode */}
              {isVenomMode && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    revertToSpidey();
                  }}
                  className="w-full mb-2 p-3 bg-white text-black font-black flex items-center justify-between border-2 border-white hover:bg-neutral-200 transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-black shrink-0" />
                    <span>[ANTIDOTE] PURGE SYMBIOTE · RESTORE SPIDER-MAN</span>
                  </div>
                  <span className="text-[10px] bg-black text-white px-2 py-0.5">CLICK TO REVERT</span>
                </button>
              )}

              {filtered.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between p-3 border transition-colors group ${
                    isVenomMode
                      ? "border-transparent hover:border-white hover:bg-[#141414]"
                      : "border-transparent hover:border-[#E62229] hover:bg-[#04080D]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 border ${
                        isVenomMode
                          ? "text-white border-white/40 bg-black"
                          : "text-[#E62229] border-[#E62229]/40 bg-[#04080D]"
                      }`}
                    >
                      {item.category}
                    </span>
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isVenomMode
                          ? "text-white group-hover:text-white"
                          : "text-white group-hover:text-[#E62229]"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <ArrowRight
                    className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isVenomMode ? "text-white" : "text-[#E62229]"
                    }`}
                  />
                </Link>
              ))}

              {filtered.length === 0 && (
                <div className="p-6 text-center text-xs text-[#888888]">
                  [NO MATCHING COMMANDS FOUND]
                </div>
              )}
            </div>

            {/* Tip Footer */}
            <div
              className={`px-4 py-2 border-t flex justify-between items-center text-[10px] text-[#aaaaaa] ${
                isVenomMode
                  ? "border-white/30 bg-[#000000]"
                  : "border-[#E62229]/40 bg-[#04080D]"
              }`}
            >
              <span>
                {isVenomMode
                  ? "Tip: Type 'spider' to purge the symbiote"
                  : "Tip: Type 'venom' to awaken the symbiote"}
              </span>
              <span>ROOM 312</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default SearchModal;

