"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Printer, RefreshCw, FileText, CheckCircle2, AlertTriangle, ArrowUpRight } from "lucide-react";
import { formatBengaliDate } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function NoticeMakerPage() {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    const today = new Date();
    setDate(
      new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10)
    );
  }, []);

  const handlePrint = () => {
    if (!body.trim()) {
      alert("Please enter the notice body before printing or saving to PDF.");
      return;
    }
    window.print();
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
  };

  return (
    <div className="space-y-12">
      {/* Intro Header (hidden on print) */}
      <section className="print:hidden border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// NOTICE DISPATCH GENERATOR // A4 DOCUMENT SYSTEM // ROOM 312
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="bg-black text-[#E62229] px-2 py-0.5 border border-black">OUTPUT: HIGH_RES_A4</span>
            <span className="bg-black text-white px-2 py-0.5 border border-black">STANDARD: CMHS_OFFICIAL</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#081726] text-[#F5E8C7] space-y-4">
          <span className="text-xs font-black tracking-widest text-[#E62229] uppercase">
            DOCUMENT FACTORY
          </span>
          <h1 className="text-4xl sm:text-6xl font-mech-wide font-black text-white tracking-wide">
            NOTICE MAKER
          </h1>
          <p className="text-xs sm:text-sm text-[#cccccc] max-w-2xl leading-relaxed">
            Write announcements in plain text, review the real-time school letterhead preview, and click &ldquo;Print / Save PDF&rdquo; to produce an official high-resolution A4 notice.
          </p>
          <div className="h-4 w-full hazard-stripes border-t border-b border-[#F5E8C7]/60" />
        </div>
      </section>

      {/* Editor & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Form (hidden on print) */}
        <div className="print:hidden lg:col-span-5 border-2 border-[#E62229] bg-[#081726] p-6 sm:p-8 shadow-[6px_6px_0px_#000000] space-y-6">
          <div className="flex items-center justify-between border-b-2 border-[#E62229] pb-3">
            <h2 className="text-lg font-black text-white uppercase flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#E62229]" />
              <span>Notice Parameters</span>
            </h2>
            <span className="text-[10px] font-mono text-[#E62229]">FORM_INPUT</span>
          </div>

          <div className="space-y-4 font-mono text-xs">
            <div>
              <label className="block text-[#F5E8C7] uppercase font-bold mb-1.5">
                Notice Heading
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Batch 1 Class Schedule & Workshop"
                maxLength={160}
                className="w-full bg-[#04080D] border-2 border-[#E62229] px-3.5 py-2.5 text-[#F5E8C7] focus:outline-none focus:ring-1 focus:ring-[#E62229]"
              />
            </div>

            <div>
              <label className="block text-[#F5E8C7] uppercase font-bold mb-1.5">
                Notice Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#04080D] border-2 border-[#E62229] px-3.5 py-2.5 text-[#F5E8C7] focus:outline-none focus:ring-1 focus:ring-[#E62229]"
              />
            </div>

            <div>
              <label className="block text-[#F5E8C7] uppercase font-bold mb-1.5">
                Notice Body Text
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write the announcement text here. Paragraph breaks and new lines will be preserved on the official printed letterhead."
                rows={12}
                className="w-full bg-[#04080D] border-2 border-[#E62229] p-3.5 text-[#F5E8C7] focus:outline-none focus:ring-1 focus:ring-[#E62229] leading-relaxed resize-y"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="btn-cyber-primary text-xs py-2.5 px-5 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT / SAVE PDF</span>
            </button>
            <button
              onClick={handleReset}
              className="btn-cyber-navy text-xs py-2.5 px-4 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>CLEAR</span>
            </button>
          </div>

          <p className="text-[11px] text-[#aaaaaa] leading-relaxed pt-2 font-mono">
            Tip: In your browser&apos;s print dialog, select &ldquo;Save as PDF&rdquo; with paper size &ldquo;A4&rdquo; and background graphics enabled for best layout.
          </p>
        </div>

        {/* Live A4 Print Letterhead Preview */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="printable-notice"
            className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-[20mm] shadow-2xl flex flex-col justify-between print:shadow-none print:m-0 print:p-[20mm] print:w-full print:max-w-none font-serif select-text"
          >
            {/* School Letterhead Header */}
            <div>
              <div className="flex items-center gap-4 border-b-2 border-black pb-4">
                <div className="w-16 h-16 relative shrink-0">
                  <Image
                    src="/assets/brand/cmhs-prc-profile.svg"
                    alt="CMHS PRC"
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 text-center pr-12">
                  <h2 className="text-xl font-bold tracking-tight text-black">
                    CUMILLA MODERN HIGH SCHOOL
                  </h2>
                  <h3 className="text-sm font-semibold text-gray-800 tracking-wider">
                    PROGRAMMING & ROBOTICS CLUB (CMHS PRC)
                  </h3>
                  <p className="text-[11px] text-gray-600 font-sans mt-0.5">
                    Room 312, Cumilla Modern High School Campus, Cumilla-3500
                  </p>
                </div>
              </div>

              {/* Reference Number & Date Line */}
              <div className="flex justify-between items-center text-xs font-sans mt-4 text-gray-700">
                <span>
                  <strong>Ref:</strong> CMHS-PRC/NOTICE/
                  {date ? date.replace(/-/g, "") : "2026"}
                </span>
                <span>
                  <strong>Date:</strong> {date || "YYYY-MM-DD"} (
                  {date ? formatBengaliDate(date) : ""})
                </span>
              </div>

              {/* Notice Title Banner */}
              <div className="text-center my-8">
                <span className="inline-block border-2 border-black px-6 py-1 text-sm font-bold uppercase tracking-widest bg-gray-100">
                  NOTICE
                </span>
                {title && (
                  <h4 className="text-base font-bold underline mt-4 text-black">
                    {title}
                  </h4>
                )}
              </div>

              {/* Notice Body */}
              <div className="text-xs sm:text-sm leading-relaxed text-gray-900 whitespace-pre-wrap text-justify min-h-[140mm]">
                {body || (
                  <span className="text-gray-400 italic">
                    Type your notice content in the editor on the left to see it formatted here in real-time...
                  </span>
                )}
              </div>
            </div>

            {/* Letterhead Signature Block */}
            <div className="pt-8 border-t border-gray-300 flex justify-between items-end text-xs font-sans">
              <div className="space-y-1">
                <div className="w-32 border-b border-black pt-8" />
                <p className="font-bold text-gray-900">Advisory Teacher</p>
                <p className="text-[10px] text-gray-600">Cumilla Modern High School</p>
              </div>

              <div className="space-y-1 text-right">
                <div className="w-32 border-b border-black pt-8 ml-auto" />
                <p className="font-bold text-gray-900">Executive Committee</p>
                <p className="text-[10px] text-gray-600">CMHS PRC · Room 312</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
