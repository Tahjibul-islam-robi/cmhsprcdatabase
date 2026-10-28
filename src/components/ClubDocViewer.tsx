"use client";

import React, { useState } from "react";
import {
  Download,
  ExternalLink,
  Play,
  Code2,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  Laptop,
  Smartphone,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { getPublicStorageUrl } from "@/lib/supabase";
import type { BlogPost } from "@/lib/types";

interface ClubDocViewerProps {
  post: BlogPost;
  onClose?: () => void;
}

// Helper to strip HTML tags for clean summaries
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Detect feature tags for post badges
export function detectPostFeatures(post: BlogPost): string[] {
  const body = (post.body || "").toLowerCase();
  const features: string[] = [];

  if (body.includes("codeblocks") || body.includes("code::blocks")) {
    features.push("IDE Setup");
  }
  if (body.includes("onlinegdb") || body.includes("online compiler")) {
    features.push("Online Compiler");
  }
  if (body.includes("module") || body.includes("youtube.com")) {
    features.push("Video Lessons");
  }
  if (body.includes("#include") || body.includes("cout<<") || body.includes("practice code")) {
    features.push("C++ Practice");
  }
  if (body.includes("home work") || body.includes("homework")) {
    features.push("Homework Task");
  }
  if (post.object_path || post.file_name) {
    features.push("PDF Attached");
  }

  return features;
}

interface ParsedLessonData {
  codeblocksDownloadUrl?: string;
  codeblocksTutorialUrl?: string;
  onlineCompilerUrl?: string;
  modules: Array<{ id: string; title: string; url: string; note?: string }>;
  cppCode?: string;
  homeworkText?: string;
  otherText?: string;
}

// Parser for the club lesson format
export function parseClubLessonContent(rawHtml: string): ParsedLessonData {
  const data: ParsedLessonData = {
    modules: [],
  };

  if (!rawHtml) return data;

  // 1. Code::Blocks download link
  const cbDownloadMatch = rawHtml.match(
    /href="(https:\/\/[^"]*codeblocks[^"]*setup\.exe[^"]*)"/i
  );
  if (cbDownloadMatch) {
    data.codeblocksDownloadUrl = cbDownloadMatch[1];
  } else {
    const cbAny = rawHtml.match(/href="(https:\/\/[^"]*sourceforge[^"]*codeblocks[^"]*)"/i);
    if (cbAny) data.codeblocksDownloadUrl = cbAny[1];
  }

  // 2. Code::Blocks download tutorial
  const cbTutorialMatch = rawHtml.match(
    /Code::Blocks Download Tutorial:[^<]*<a[^>]*href="(https:\/\/(?:www\.)?youtube\.com\/watch\?v=[^"&]+)"/i
  );
  if (cbTutorialMatch) {
    data.codeblocksTutorialUrl = cbTutorialMatch[1];
  }

  // 3. Online compiler
  const compilerMatch = rawHtml.match(
    /href="(https:\/\/[^"]*onlinegdb\.com[^"]*)"/i
  );
  if (compilerMatch) {
    data.onlineCompilerUrl = compilerMatch[1];
  }

  // 4. Video Modules
  // Matches "Module X: [notes] <a href="youtube...">..." or similar
  const moduleRegex =
    /Module\s+(\d+)(?:\s*:\s*([^<]+))?.*?href="((?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^"]+)"(?:[^<]*\(([^)]+)\))?/gi;
  let mMatch;
  while ((mMatch = moduleRegex.exec(rawHtml)) !== null) {
    const modNum = mMatch[1];
    let rawTitle = (mMatch[2] || "").trim();
    const url = mMatch[3];
    const parenNote = (mMatch[4] || "").trim();

    // Clean up title
    rawTitle = rawTitle
      .replace(/&quot;/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/"\/n"/, 'Escape Sequence ("\\n")')
      .trim();

    let fullTitle = rawTitle;
    if (parenNote) {
      fullTitle = fullTitle ? `${fullTitle} · ${parenNote}` : parenNote;
    }
    if (!fullTitle) {
      fullTitle = `Lesson Video Module ${modNum}`;
    }

    data.modules.push({
      id: modNum,
      title: fullTitle,
      url,
    });
  }

  // 5. Practice Code
  // Matches #include <iostream> ... up to end of block
  const codeMatch = rawHtml.match(
    /(?:Practice Code:[\s\S]*?)(#include\s*(?:&lt;|<)iostream(?:&gt;|>)(?:[\s\S]*?)return\s+0;\s*})/i
  );
  if (codeMatch) {
    let cleanCode = codeMatch[1]
      .replace(/<[^>]+>/g, "\n")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();
    data.cppCode = cleanCode;
  }

  // 6. Homework text
  const hwMatch = rawHtml.match(
    /(Home\s*Work![\s\S]*?)(?:<\/div>|<\/p>|$)/i
  );
  if (hwMatch) {
    data.homeworkText = stripHtml(hwMatch[1]);
  }

  return data;
}

export function ClubDocViewer({ post, onClose }: ClubDocViewerProps) {
  const [copied, setCopied] = useState(false);
  const parsed = parseClubLessonContent(post.body || "");
  const fileUrl = post.object_path ? getPublicStorageUrl(post.object_path) : null;
  const features = detectPostFeatures(post);

  const handleCopyCode = () => {
    if (!parsed.cppCode) return;
    navigator.clipboard.writeText(parsed.cppCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-mono text-xs sm:text-sm">
      {/* Document Header Card */}
      <div className="p-4 sm:p-6 bg-[#04080D] border-2 border-[#E62229] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                post.category === "material"
                  ? "bg-[#00F0FF] text-black"
                  : "bg-[#E62229] text-black"
              }`}
            >
              {post.category}
            </span>
            {post.batch_name && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-[#111111] text-[#F5E8C7] border border-white/20">
                {post.batch_name}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#aaaaaa]">
            Dispatched: {new Date(post.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
          {post.title}
        </h2>

        {/* Feature Tags */}
        {features.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {features.map((feat) => (
              <span
                key={feat}
                className="text-[10px] px-2 py-0.5 border border-[#E62229]/50 bg-[#081726] text-[#F5E8C7]"
              >
                [{feat}]
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Official PDF Attachment Card (If attached) */}
      {fileUrl && (
        <div className="p-4 bg-[#081726] border-2 border-white/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#E62229] text-black flex items-center justify-center shrink-0 border border-black">
              <FileText className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] text-[#aaaaaa] block font-bold">
                ATTACHED DOCUMENT / HOMEWORK SHEET
              </span>
              <span className="font-bold text-white text-xs sm:text-sm block">
                {post.file_name || "Official Attachment.pdf"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial btn-cyber-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD PDF</span>
            </a>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 border border-white/30 text-white hover:bg-white/10 transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Code::Blocks Setup Section (If available in this post) */}
      {(parsed.codeblocksDownloadUrl || parsed.codeblocksTutorialUrl) && (
        <div className="p-5 bg-[#081726] border-2 border-[#E62229] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E62229]/40 pb-2">
            <Laptop className="w-4 h-4 text-[#E62229]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              01. Code::Blocks IDE & MinGW Compiler (PC / Windows)
            </h3>
          </div>

          <p className="text-xs text-[#cccccc] leading-relaxed">
            Download the official Code::Blocks setup bundled with the GCC MinGW compiler to run C++ on Windows without configuring paths manually.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {parsed.codeblocksDownloadUrl && (
              <a
                href={parsed.codeblocksDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber-primary text-xs px-4 py-2.5 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD CODE::BLOCKS 25.03 MINGW (.EXE)</span>
              </a>
            )}

            {parsed.codeblocksTutorialUrl && (
              <a
                href={parsed.codeblocksTutorialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 border-2 border-[#E62229] text-white hover:bg-[#E62229] hover:text-black font-black text-xs transition-colors flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>INSTALLATION VIDEO TUTORIAL</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Online Compiler Section */}
      {parsed.onlineCompilerUrl && (
        <div className="p-5 bg-[#081726] border-2 border-[#00F0FF] space-y-3">
          <div className="flex items-center gap-2 border-b border-[#00F0FF]/40 pb-2">
            <Smartphone className="w-4 h-4 text-[#00F0FF]" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              02. Online C++ Compiler (Mobile & Web)
            </h3>
          </div>

          <p className="text-xs text-[#cccccc] leading-relaxed">
            If you are on a smartphone, tablet, or school Chromebook, you can write, compile, and run C++ directly in your browser without installing anything.
          </p>

          <div>
            <a
              href={parsed.onlineCompilerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00F0FF] text-black font-black text-xs hover:bg-white transition-colors"
            >
              <span>OPEN ONLINEGDB C++ COMPILER</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>
      )}

      {/* Video Learning Modules */}
      {parsed.modules.length > 0 && (
        <div className="p-5 bg-[#04080D] border-2 border-[#E62229] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E62229]/40 pb-2">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-[#E62229] fill-current" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                03. Video Lecture Modules ({parsed.modules.length} Lessons)
              </h3>
            </div>
            <span className="text-[10px] text-[#aaaaaa]">ROOM 312 SYLLABUS</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {parsed.modules.map((mod) => (
              <a
                key={mod.id + mod.url}
                href={mod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-[#081726] border border-[#E62229]/40 hover:border-[#E62229] hover:bg-[#0c1a29] transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-[#E62229] text-black font-black flex items-center justify-center text-xs shrink-0">
                    {mod.id.padStart(2, "0")}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E62229] transition-colors block">
                      {mod.title}
                    </span>
                    <span className="text-[10px] text-[#888888]">
                      Click to watch lesson on YouTube
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#E62229] font-bold shrink-0">
                  <span className="hidden sm:inline">WATCH</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Practice C++ Code Block */}
      {parsed.cppCode && (
        <div className="border-2 border-[#E62229] bg-[#04080D] overflow-hidden">
          <div className="bg-[#E62229] text-black px-4 py-2 font-mono font-black text-xs flex items-center justify-between border-b-2 border-black">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 stroke-[2.5]" />
              <span>PRACTICE SOURCE CODE // main.cpp</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2.5 py-1 bg-black text-white hover:bg-neutral-800 transition-colors text-[10px] font-bold"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-400" />
                  <span>COPIED!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY CODE</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 overflow-x-auto text-xs text-[#F5E8C7] font-mono leading-relaxed bg-[#020508]">
            <code>{parsed.cppCode}</code>
          </pre>
        </div>
      )}

      {/* Homework Instructions */}
      {parsed.homeworkText && (
        <div className="p-5 bg-[#081726] border-2 border-yellow-500/80 space-y-3">
          <div className="flex items-center gap-2 border-b border-yellow-500/40 pb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-black text-yellow-300 uppercase tracking-wider">
              Homework & Submission Protocol
            </h3>
          </div>

          <p className="text-xs text-[#cccccc] leading-relaxed">
            {parsed.homeworkText}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/40 font-bold">
              SUBMIT VIA WHATSAPP: ROBI / TAMZID
            </span>
            <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 font-bold">
              NO AI GENERATED CODE ALLOWED
            </span>
          </div>
        </div>
      )}

      {/* Fallback for general text or announcements that don't match the lesson parser */}
      {!parsed.codeblocksDownloadUrl &&
        !parsed.onlineCompilerUrl &&
        parsed.modules.length === 0 &&
        !parsed.cppCode &&
        !parsed.homeworkText &&
        post.body && (
          <div className="p-5 bg-[#081726] border-2 border-white/20 space-y-3 text-xs leading-relaxed text-[#cccccc]">
            <div
              className="prose prose-invert max-w-none text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />
          </div>
        )}

      {/* Close button if inside modal */}
      {onClose && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="btn-cyber-primary text-xs px-6 py-2"
          >
            CLOSE DOCUMENT
          </button>
        </div>
      )}
    </div>
  );
}

export default ClubDocViewer;