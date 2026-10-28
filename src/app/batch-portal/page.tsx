"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Terminal,
  Users,
  BookOpen,
  Bell,
  Download,
  Search,
  ShieldCheck,
  ArrowUpRight,
  FileText,
  Clock,
  Layers,
} from "lucide-react";
import { supabase, getPublicStorageUrl } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { BatchItem, BlogPost, StudentRosterItem } from "@/lib/types";
import { stripHtml } from "@/components/ClubDocViewer";

export default function BatchPortalPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>("");
  const [announcements, setAnnouncements] = useState<BlogPost[]>([]);
  const [materials, setMaterials] = useState<BlogPost[]>([]);
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);
  const [rosterSearch, setRosterSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBatches() {
      try {
        const { data } = await supabase.rpc("get_public_batches");
        if (data && data.length > 0) {
          setBatches(data);
          setSelectedBatchId(data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatchId) return;

    async function loadBatchDetails() {
      try {
        const [annRes, matRes, rosRes] = await Promise.all([
          supabase.rpc("get_public_batch_announcements", { p_batch_id: selectedBatchId, p_limit: 20 }),
          supabase.rpc("get_public_batch_materials", { p_batch_id: selectedBatchId, p_limit: 20 }),
          supabase.rpc("get_public_batch_roster", { p_batch_id: selectedBatchId }),
        ]);

        if (annRes.data) setAnnouncements(annRes.data);
        if (matRes.data) setMaterials(matRes.data);
        if (rosRes.data) setRoster(rosRes.data);
      } catch (err) {
        console.error("Batch details error:", err);
      }
    }
    loadBatchDetails();
  }, [selectedBatchId]);

  const activeBatch = batches.find((b) => b.id === selectedBatchId);
  const filteredRoster = roster.filter(
    (s) =>
      s.full_name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.student_id.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* =========================================================================
          HERO POSTER: CYBER BATCH TERMINAL
          ========================================================================= */}
      <section className="border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// BATCH TERMINAL // STUDENT REPOSITORY // ROOM 312
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="bg-black text-[#E62229] px-2 py-0.5 border border-black">NODE: SECURE_PORTAL</span>
            <span className="bg-black text-white px-2 py-0.5 border border-black">CLEARANCE: VERIFIED</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#081726] text-[#F5E8C7] space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#E62229] pb-6">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#E62229] uppercase">
                STUDENT COHORTS // CLASSES 6 THROUGH 10
              </span>
              <h1 className="text-4xl sm:text-6xl font-mech-wide font-black text-white tracking-wide">
                BATCH PORTAL
              </h1>
              <p className="text-xs sm:text-sm text-[#cccccc] max-w-xl">
                Access authenticated student rosters, lecture notes, workshop problem archives, and internal announcements for your active batch.
              </p>
            </div>

            {/* Batch Selector Dropdown */}
            <div className="min-w-[260px] space-y-1">
              <label className="block text-[11px] font-mono text-[#F5E8C7] uppercase font-black">
                SELECT ACTIVE COHORT:
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-[#04080D] border-2 border-[#E62229] px-4 py-2.5 text-xs text-[#F5E8C7] font-black focus:outline-none focus:ring-2 focus:ring-[#E62229] shadow-[4px_4px_0px_#000000]"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Batch #{b.batch_number})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Batch Summary Banner */}
          {activeBatch && (
            <div className="border-2 border-[#E62229] bg-[#04080D] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[4px_4px_0px_#E62229]">
              <div>
                <span className="text-[10px] font-mono text-[#E62229] uppercase font-black block">
                  CURRENTLY ACTIVE COHORT
                </span>
                <h2 className="text-2xl font-black text-white uppercase mt-0.5">
                  {activeBatch.name}
                </h2>
                {activeBatch.description && (
                  <p className="text-xs text-[#aaaaaa] mt-1">{activeBatch.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <span className="border border-[#F5E8C7] px-3 py-1 bg-[#081726] text-[#F5E8C7] font-bold">
                  BATCH #{activeBatch.batch_number}
                </span>
                <span className="bg-[#E62229] text-black font-black px-3 py-1">
                  ROOM 312
                </span>
              </div>
            </div>
          )}

          {/* Hazard Divider */}
          <div className="h-5 w-full hazard-stripes border-t border-b border-[#F5E8C7]/60" />
        </div>
      </section>

      {/* =========================================================================
          SECTION 01: ENROLLED STUDENT ROSTER
          ========================================================================= */}
      <ScrollReveal className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-[#E62229] pb-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3">
              <Users className="w-5 h-5 text-[#E62229]" />
              <span>Enrolled Student Roster</span>
              <span className="text-xs font-black px-2 py-0.5 bg-[#E62229] text-black">
                {filteredRoster.length} VERIFIED
              </span>
            </h2>
            <p className="text-xs text-[#aaaaaa]">
              Official club student identification directory for Room 312 access.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E62229]" />
            <input
              type="text"
              placeholder="SEARCH NAME OR ID..."
              value={rosterSearch}
              onChange={(e) => setRosterSearch(e.target.value)}
              className="w-full bg-[#04080D] border-2 border-[#E62229] pl-9 pr-3 py-1.5 text-xs text-[#F5E8C7] font-mono placeholder:text-[#666666] focus:outline-none focus:ring-1 focus:ring-[#E62229]"
            />
          </div>
        </div>

        {filteredRoster.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredRoster.map((s, idx) => (
              <div
                key={idx}
                className="border-2 border-[#E62229] bg-[#081726] p-4 shadow-[4px_4px_0px_#000000] space-y-2 hover:-translate-y-0.5 transition-transform"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#E62229] font-black">{s.student_id}</span>
                  <span className="border border-[#F5E8C7]/40 px-1.5 py-0.2 bg-[#04080D] text-[10px] text-[#F5E8C7]">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-sm font-black text-white uppercase truncate">
                  {s.full_name}
                </h3>
                <div className="text-[10px] text-[#aaaaaa] font-mono flex justify-between border-t border-[#E62229]/30 pt-1.5">
                  <span>STATUS: VERIFIED</span>
                  <span>ROOM 312</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-white/20 bg-[#04080D] p-8 text-center font-mono text-xs text-[#aaaaaa]">
            [NO_STUDENTS_MATCH_ACTIVE_SEARCH_OR_BATCH]
          </div>
        )}
      </ScrollReveal>

      {/* =========================================================================
          SECTION 02: BATCH ANNOUNCEMENTS & MATERIALS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Announcements */}
        <ScrollReveal className="space-y-4">
          <div className="flex items-center justify-between border-b-4 border-[#E62229] pb-2">
            <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#E62229]" />
              <span>Cohort Announcements</span>
            </h3>
            <span className="text-xs font-mono text-[#E62229]">{announcements.length} POSTS</span>
          </div>

          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="border-2 border-[#E62229] bg-[#081726] p-5 shadow-[4px_4px_0px_#000000] space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#aaaaaa]">
                    <span className="text-[#E62229] font-bold">/// ROOM 312 BULLETIN</span>
                    <span>{formatDate(ann.created_at)}</span>
                  </div>
                  <h4 className="text-base font-black text-white uppercase">{ann.title}</h4>
                  <p className="text-xs text-[#cccccc] leading-relaxed line-clamp-3">
                    {stripHtml(ann.body) || (ann.file_name ? `Attached file: ${ann.file_name}. Download from materials panel.` : "Official batch announcement.")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-white/10 bg-[#04080D] p-6 text-center font-mono text-xs text-[#888888]">
              [NO_ANNOUNCEMENTS_LOGGED_FOR_THIS_BATCH]
            </div>
          )}
        </ScrollReveal>

        {/* Right Column: Lecture Materials & Downloads */}
        <ScrollReveal className="space-y-4">
          <div className="flex items-center justify-between border-b-4 border-[#E62229] pb-2">
            <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
              <Download className="w-4 h-4 text-[#E62229]" />
              <span>Lecture Materials & Archives</span>
            </h3>
            <span className="text-xs font-mono text-[#E62229]">{materials.length} FILES</span>
          </div>

          {materials.length > 0 ? (
            <div className="space-y-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="border-2 border-[#E62229] bg-[#081726] p-5 shadow-[4px_4px_0px_#000000] flex items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#E62229] uppercase font-bold block">
                      RESOURCE FILE
                    </span>
                    <h4 className="text-sm font-black text-white uppercase group-hover:text-[#E62229] transition-colors">
                      {mat.title}
                    </h4>
                    <span className="text-[10px] font-mono text-[#888888] block">
                      {formatDate(mat.created_at)}
                    </span>
                  </div>

                  <a
                    href={getPublicStorageUrl(mat.object_path) || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-cyber-primary text-xs px-3 py-2 shrink-0"
                  >
                    <span>DOWNLOAD</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-white/10 bg-[#04080D] p-6 text-center font-mono text-xs text-[#888888]">
              [NO_DOWNLOADABLE_ARCHIVES_LOGGED_YET]
            </div>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
}
