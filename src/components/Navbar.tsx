"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, QrCode, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVenom } from "./VenomProvider";
import { SearchModal } from "./SearchModal";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/events", label: "EVENTS" },
  { href: "/batch-portal", label: "PORTAL" },
  { href: "/blog", label: "DOCS" },
  { href: "/team", label: "TEAM" },
  { href: "/rules", label: "RULES" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isVenomMode, toggleVenom, revertToSpidey } = useVenom();

  // Listen for Ctrl+K / Cmd+K to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full font-mono border-b-2 transition-colors duration-500 select-none ${
          isVenomMode
            ? "bg-[#000000] text-white border-white shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
            : "bg-[#E62229] text-black border-black"
        }`}
      >
        <div
          className={`w-full flex items-stretch justify-between h-14 sm:h-16 divide-x-2 transition-colors duration-500 ${
            isVenomMode ? "divide-white/30" : "divide-black"
          }`}
        >
          {/* Brand Cell: Clean, Clear Logo + School Name */}
          <Link
            href="/"
            onClick={(e: React.MouseEvent) => {
              if (isVenomMode && pathname === "/") {
                e.preventDefault();
                revertToSpidey();
              }
            }}
            title={
              isVenomMode
                ? "Click to purge symbiote & restore Spider-Man style"
                : "CMHS PRC Home"
            }
            className={`flex items-center gap-3 px-4 sm:px-6 transition-colors shrink-0 group ${
              isVenomMode
                ? "bg-[#000000] text-white hover:bg-[#111111]"
                : "bg-[#04080D] text-white hover:bg-[#0c1a29]"
            }`}
          >
            <div
              className={`w-9 h-9 relative shrink-0 border-2 p-1 flex items-center justify-center transition-all ${
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
                className={`object-contain transition-all ${
                  isVenomMode ? "filter drop-shadow-[0_0_8px_#FFFFFF] brightness-125" : ""
                }`}
                priority
              />
            </div>
            <div className="flex flex-col">
              <span
                className={`font-black text-xs sm:text-sm tracking-wider transition-colors ${
                  isVenomMode
                    ? "text-white group-hover:text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                    : "text-[#F5E8C7] group-hover:text-[#E62229]"
                }`}
              >
                {isVenomMode ? "/// WE ARE VENOM" : "CMHS PRC"}
              </span>
              <span className="text-[10px] text-[#aaaaaa] font-semibold tracking-normal hidden xs:inline">
                {isVenomMode ? "Symbiote Infiltration // Room 312" : "Cumilla Modern High School"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className={`hidden lg:flex items-stretch flex-1 divide-x-2 text-xs font-black transition-colors ${
              isVenomMode ? "divide-white/30 text-white" : "divide-black text-black"
            }`}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex-1 flex items-center justify-center px-2 sm:px-3 tracking-wider transition-all relative group overflow-hidden ${
                    isActive
                      ? isVenomMode
                        ? "bg-[#181818] text-white shadow-inner font-black"
                        : "bg-[#04080D] text-[#E62229] shadow-inner font-black"
                      : isVenomMode
                      ? "text-white hover:bg-white/10 hover:text-white"
                      : "text-black hover:bg-black/10 hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span
                      className={`absolute bottom-0 inset-x-0 h-1 ${
                        isVenomMode ? "bg-white" : "bg-[#E62229]"
                      }`}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: NO ADMIN BUTTON & REMOVED TECHNICAL ROOM METADATA BOX */}
          <div
            className={`flex items-stretch divide-x-2 shrink-0 ${
              isVenomMode ? "divide-white/30" : "divide-black"
            }`}
          >
            {/* Search Command Bar Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 transition-colors text-xs font-black cursor-pointer ${
                isVenomMode
                  ? "bg-[#000000] text-white hover:text-white hover:bg-[#151515]"
                  : "bg-[#04080D] text-[#F5E8C7] hover:text-[#E62229] hover:bg-[#0c1a29]"
              }`}
              title="Search command (Ctrl+K)"
            >
              <Search
                className={`w-3.5 h-3.5 ${
                  isVenomMode ? "text-white" : "text-[#E62229]"
                }`}
              />
              <span className="hidden md:inline">SEARCH</span>
              <span className="text-[9px] opacity-60 hidden 2xl:inline bg-black/40 border border-white/20 px-1 py-0.2">
                Ctrl+K
              </span>
            </button>

            {/* JOIN CLUB Button */}
            <Link
              href="/join"
              className={`flex items-center gap-1 px-4 sm:px-6 text-xs font-black tracking-wider transition-colors ${
                isVenomMode
                  ? "bg-white text-black hover:bg-neutral-200 shadow-[0_0_15px_rgba(255,255,255,0.7)]"
                  : "bg-[#F5E8C7] text-black hover:bg-white"
              }`}
            >
              <span>{isVenomMode ? "JOIN HIVE" : "JOIN CLUB"}</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden flex items-center justify-center px-4 bg-black text-white hover:bg-black/80 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden border-t-2 px-6 py-4 space-y-3 font-mono ${
                isVenomMode
                  ? "border-white bg-[#000000] text-white"
                  : "border-black bg-[#04080D] text-[#F5E8C7]"
              }`}
            >
              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`p-2.5 border ${
                      pathname === link.href
                        ? isVenomMode
                          ? "bg-white text-black font-black border-white"
                          : "bg-[#E62229] text-black font-black border-black"
                        : isVenomMode
                        ? "bg-[#111111] text-white border-white/30 hover:bg-white/20"
                        : "bg-[#081726] text-white border-[#E62229]/40 hover:bg-[#E62229]/20"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSearchOpen(true);
                  }}
                  className={`font-bold flex items-center gap-1.5 cursor-pointer ${
                    isVenomMode ? "text-white" : "text-[#E62229]"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                <span className="text-[10px] text-[#aaaaaa]">Room 312 · CMHS</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Search & Command Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

export default Navbar;
