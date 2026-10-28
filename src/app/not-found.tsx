"use client";

import Link from "next/link";
import { ArrowLeft, Home, Terminal, AlertTriangle, ArrowUpRight } from "lucide-react";
import { Dithered404 } from "@/components/ui/dithered-404";

export default function NotFound() {
  return (
    <div className="relative min-h-[78vh] flex flex-col items-center justify-center p-4">
      {/* Background Interactive Fireball Dither 404 Canvas */}
      <div className="relative w-full max-w-4xl h-[460px] sm:h-[540px] border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden flex flex-col items-center justify-center">
        <Dithered404
          className="absolute inset-0 z-0"
          pixelSize={4}
          brush={32}
          interactive={true}
          dither={true}
          theme="dark"
          color="#E62229"
        />

        {/* Foreground Cyberpunk Card Overlay */}
        <div className="relative z-10 text-center space-y-4 px-6 py-8 border-2 border-[#E62229] bg-[#081726]/90 backdrop-blur-md max-w-md mx-auto shadow-[6px_6px_0px_#000000] pointer-events-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E62229] text-black font-black text-xs font-mono">
            <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" />
            <span>ERR_NODE_NOT_FOUND // 404</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Lost in Room 312
          </h1>

          <p className="text-xs font-mono text-[#cccccc] leading-relaxed">
            The requested batch resource or page does not exist. Move your cursor across the canvas to ignite the dithered firewall glyph.
          </p>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link href="/" className="btn-cyber-primary text-xs">
              <Home className="w-3.5 h-3.5" />
              <span>RETURN TO BASE</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
